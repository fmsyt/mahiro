use std::{io::Error, sync::{Arc, Mutex}, collections::HashMap, net::SocketAddr};

use axum::{Router, extract::{WebSocketUpgrade, ConnectInfo, Extension, ws::{WebSocket, self}}, TypedHeader, headers::UserAgent, response::IntoResponse, routing::get};
use futures_channel::mpsc::{unbounded, UnboundedSender};
use futures_util::{StreamExt, pin_mut, future, TryStreamExt};
use tokio_tungstenite::{accept_async, tungstenite::Message, WebSocketStream};
use tokio::net::{TcpListener, TcpStream};

use tower_http::{self, add_extension::AddExtensionLayer};

use crate::client::{ReceivedMessage, load_state, State as ClientState, SendWebSocketClientMessage, ReceiveWebSocketClientMessage};

type Tx = UnboundedSender<Message>;

struct AppState {
    peer_map: HashMap<SocketAddr, Tx>,
    client: ClientState,
}

type GlobalAppState = Arc<Mutex<AppState>>;

pub async fn start(config_directory_path: String) {
    let addr: String = "0.0.0.0:17001".to_string();

    let app_state = Arc::new(Mutex::new(AppState {
        peer_map: HashMap::new(),
        client: load_state(config_directory_path.clone()),
    }));

    let app: Router = Router::new()
        .route("/", get(root))
        .route("/ws", get(ws_handler))
        .layer(AddExtensionLayer::new(app_state.clone()))
        ;

    axum::Server::bind(&addr.parse().unwrap())
        .serve(app.into_make_service_with_connect_info::<SocketAddr>())
        .await
        .unwrap();


    // let try_socket: Result<TcpListener, Error> = TcpListener::bind(addr).await;
    // let listener: TcpListener = try_socket.expect("Failed to bind");




    // while let Ok((socket, addr)) = listener.accept().await {

    //     println!("New WebSocket connection: {}", addr);

    //     tokio::spawn(process(
    //         app_state.clone(),
    //         socket,
    //         addr
    //     ));
    // }
}

async fn root() -> &'static str {
    "Hello, World!"
}

async fn ws_handler(
    ws: WebSocketUpgrade,
    user_agent: Option<TypedHeader<UserAgent>>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Extension(state): Extension<GlobalAppState>
) -> impl IntoResponse {
    let user_agent = if let Some(TypedHeader(user_agent)) = user_agent {
        user_agent.to_string()
    } else {
        String::from("Unknown browser")
    };
    println!("`{user_agent}` at {addr} connected.");
    // finalize the upgrade process by returning upgrade callback.
    // we can customize the callback by sending additional info such as address.
    ws.on_upgrade(move |socket| handle_socket(state, socket, addr))
}

async fn handle_socket(app_state: GlobalAppState, mut socket: WebSocket, addr: SocketAddr) {

    println!("{}", app_state.lock().unwrap().client.sheets.len());


    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(message)) = socket.next().await {
            match message {
                axum::extract::ws::Message::Text(text) => {
                    println!("Received a message from {}: {}", addr, text);
                    let try_json = serde_json::from_str::<ReceivedMessage>(text.as_str());

                    let json = try_json.unwrap();

                    match json.method.as_str() {
                        "emit" => {

                            if let Some(data) = json.data {
                                let state = app_state.lock().unwrap();
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
                            let state = app_state.lock().unwrap();

                            let message = state.client.sheets_update();
                            let peer = state.peer_map.get(&addr).unwrap();
                            peer.unbounded_send(message).unwrap();
                        }
                        _ => {
                            eprintln!("Warn: Invalid method")
                        }
                    }
                }
                _ => {
                    println!("Received a message from {}: {:?}", addr, message);
                }
            }
        }
    });

    println!("{} disconnected", addr);
}




// async fn process(app_state: GlobalAppState, socket: TcpStream, addr: SocketAddr) {

//     // print protocol
//     println!("Protocol: {:?}", socket.peer_addr().unwrap().to_string());

//     if let Ok(websocket) = accept_async(socket).await {
//         ws_process(app_state, websocket, addr).await;
//         return;
//     }

// }



// async fn ws_process(app_state: GlobalAppState, websocket: WebSocketStream<TcpStream>, addr: SocketAddr) {
//     let (tx, rx) = unbounded();
//     app_state.lock().unwrap().peer_map.insert(addr, tx);

//     let (outgoing, incoming) = websocket.split();

//     let broadcast_incoming = incoming.try_for_each(|message| {
//         let try_json = serde_json::from_str::<ReceivedMessage>(&message.to_string());

//         if let Err(_) = try_json {
//             return future::ok(());
//         }

//         let json = try_json.unwrap();

//         match json.method.as_str() {
//             "emit" => {

//                 if let Some(data) = json.data {

//                     let state = app_state.lock().unwrap();

//                     if let Err(e) = state.client.emit(data.action, data.event, data.context, None) {
//                         eprintln!("Error: {}", e);
//                     }

//                 } else {
//                     eprintln!("Warn: Invalid emit message")
//                 }

//             }
//             "general.update" => {
//             }
//             "sheets.update" => {
//                 let state = app_state.lock().unwrap();

//                 let message = state.client.sheets_update();
//                 let peer = state.peer_map.get(&addr).unwrap();
//                 peer.unbounded_send(message).unwrap();
//             }
//             _ => {
//                 eprintln!("Warn: Invalid method")
//             }
//         }

//         future::ok(())
//     });

//     let receive_from_others = rx.map(Ok).forward(outgoing);

//     pin_mut!(broadcast_incoming, receive_from_others);
//     future::select(broadcast_incoming, receive_from_others).await;

//     app_state.lock().unwrap().peer_map.remove(&addr);
//     println!("{} disconnected", addr);
// }
