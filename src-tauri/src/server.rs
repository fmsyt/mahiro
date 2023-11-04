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
    ReceiveWebSocketClientMessage
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

    #[cfg(debug_assertions)]
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


    tokio::select! {
        _ = (&mut send_task) => recv_task.abort(),
        _ = (&mut recv_task) => send_task.abort(),
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

                    if let Some(data) = json.data {

                        let state = app_state;

                        if let Err(e) = state.client.emit(data.action, data.event, data.context, None) {
                            eprintln!("Error: {}", e);
                        }

                    } else {
                        eprintln!("Warn: Invalid emit message")
                    }

                }
                "general.update" => {
                }
                "sheets.update" => {
                    let state = app_state;

                    let tx = state.tx.clone();

                    let message = state.client.sheets_update();

                    let send_text = serde_json::to_string(&message).unwrap();
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
