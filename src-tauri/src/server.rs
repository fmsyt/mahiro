use std::sync::Arc;

use axum::{
    Router,
    extract::{
        WebSocketUpgrade,
        ws::{
            WebSocket,
            Message
        },
        State
    },
    response::IntoResponse,
    routing::get
};

use futures_util::{StreamExt, SinkExt};
use tauri::PathResolver;
use tokio::sync::broadcast;
use tower_http::services::ServeDir;

use crate::client::{
    load_state,
    ReceivedMessage,
    State as ClientState,
    SendWebSocketClientMessage,
    ReceiveWebSocketClientMessage, SendSheetItemUpdateMessage
};

struct AppState {
    tx: broadcast::Sender<String>,
    client: ClientState,
}

type GlobalAppState = Arc<AppState>;


// https://github.com/tokio-rs/axum/blob/axum-v0.6.20/examples/chat/src/main.rs
pub async fn start(resolver: PathResolver) {
    let addr: String = "0.0.0.0:17001".to_string();

    let (tx, _rx) = broadcast::channel(100);

    let config_directory_path = resolver.app_local_data_dir().unwrap();
    let app_state = Arc::new(AppState {
        tx,
        client: load_state(config_directory_path.clone()),
    });


    let uploads_serve_dir = ServeDir::new(config_directory_path.join("assets"));

    let app: Router = Router::new()
        .nest_service("/", ServeDir::new(resolver.resource_dir().unwrap().join("static")))
        .route("/ws", get(ws_handler))
        .with_state(app_state)
        .nest_service("/uploads", uploads_serve_dir)
        ;

    println!("Listening on {}", addr);

    axum::Server::bind(&addr.parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();

}


async fn ws_handler(
    ws: WebSocketUpgrade,
    State(app_state): State<GlobalAppState>
) -> impl IntoResponse {

    // finalize the upgrade process by returning upgrade callback.
    // we can customize the callback by sending additional info such as address.
    ws.on_upgrade(move |socket: WebSocket| handle_socket(socket, app_state))
}

async fn handle_socket(stream: WebSocket, app_state: GlobalAppState) {

    println!("New WebSocket connection: {:?}", stream.protocol());

    let (mut sender, mut receiver) = stream.split();


    let mut rx = app_state.tx.subscribe();

    let mut send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            // In any websocket error, break loop.
            if sender.send(Message::Text(msg)).await.is_err() {
                break;
            }
        }
    });

    let _tx = app_state.tx.clone();
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(message)) = receiver.next().await {
            websocket_process(&app_state, message);
        }
    });

    // // 1秒ごとに標準出力するタスク
    // let mut test_task = tokio::spawn(async move {
    //     loop {
    //         tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
    //         // println!("tick");
    //     }
    // });

    tokio::select! {
        _ = (&mut send_task) => recv_task.abort(),
        _ = (&mut recv_task) => send_task.abort(),
        // _ = (&mut test_task) => test_task.abort(),
    };

}


fn websocket_process(app_state: &GlobalAppState, message: Message) {
    match message {
        Message::Text(text) => {
            let try_json = serde_json::from_str::<ReceivedMessage>(text.as_str());

            if let Err(_) = try_json {
                println!("Message: {}", text);
                return;
            }

            let json = try_json.unwrap();

            match json.method.as_str() {
                "emit" => {

                    if json.data.is_none() {
                        eprintln!("Warn: Invalid emit message");
                        return;
                    }

                    let data = json.data.unwrap();

                    let emit_result = app_state.client.emit(data.action, data.event, data.context, data.payload);
                    if let Err(e) = emit_result {
                        eprintln!("Error: {}", e);
                        return;
                    }

                    let option_delta = emit_result.unwrap();
                    if option_delta.is_none() {
                        return;
                    }

                    let delta = option_delta.unwrap();
                    let send_text = serde_json::to_string(&SendSheetItemUpdateMessage::from(delta)).unwrap();

                    let tx = app_state.tx.clone();
                    tx.send(send_text).unwrap();

                }
                "general.update" => {
                }
                "sheets.update" => {
                    let message = app_state.client.sheets_update();
                    let send_text = serde_json::to_string(&message).unwrap();

                    let tx = app_state.tx.clone();
                    tx.send(send_text).unwrap();

                    // let peer = state.peer_map.get(&addr).unwrap();
                    // peer.unbounded_send(message).unwrap();
                }
                _ => {
                    eprintln!("Warn: Invalid method")
                }
            }
        }
        Message::Binary(_) => {
            println!("Received a binary message from");
        }
        // others
        _ => {}
    }

}
