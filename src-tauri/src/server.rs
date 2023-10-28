use std::{io::Error, sync::{Arc, Mutex}, collections::HashMap, net::SocketAddr};

use axum::{Router, extract::{WebSocketUpgrade, ConnectInfo, Extension, ws::{WebSocket, Message}}, TypedHeader, headers::UserAgent, response::IntoResponse, routing::get};
use futures_channel::mpsc::{unbounded, UnboundedSender};
use futures_util::{StreamExt, pin_mut, future, TryStreamExt};
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
    Extension(app_state): Extension<GlobalAppState>
) -> impl IntoResponse {
    let user_agent = if let Some(TypedHeader(user_agent)) = user_agent {
        user_agent.to_string()
    } else {
        String::from("Unknown browser")
    };
    println!("`{user_agent}` at {addr} connected.");
    // finalize the upgrade process by returning upgrade callback.
    // we can customize the callback by sending additional info such as address.
    ws.on_upgrade(move |socket| handle_socket(app_state, socket, addr))
}

async fn handle_socket(app_state: GlobalAppState, mut socket: WebSocket, addr: SocketAddr) {


    let (outgoing, incoming) = socket.split();

    let broadcast_incoming = incoming.try_for_each(|message| {

        match message {
            Message::Text(text) => {
                let try_json = serde_json::from_str::<ReceivedMessage>(text.as_str());

                if let Err(_) = try_json {
                    return future::ok(());
                }

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
            Message::Binary(_) => {
                println!("Received a binary message from {}", addr);
            }
            Message::Ping(_) => {
                println!("Received a ping from {}", addr);
            }
            Message::Pong(_) => {
                println!("Received a pong from {}", addr);
            }
            Message::Close(_) => {
                println!("Received a close from {}", addr);
            }
        }

        future::ok(())
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
