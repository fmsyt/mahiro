use std::{io::Error, sync::{Arc, Mutex}, collections::HashMap, net::SocketAddr};

use futures_channel::mpsc::{unbounded, UnboundedSender};
use futures_util::{StreamExt, pin_mut, future, TryStreamExt};
use tokio_tungstenite::{accept_async, tungstenite::Message};
use tokio::net::{TcpListener, TcpStream};

use crate::client::{ReceivedMessage, load_state, State as ClientState, SendWebSocketClientMessage, ReceiveWebSocketClientMessage};

type Tx = UnboundedSender<Message>;

struct AppState {
    peer_map: HashMap<SocketAddr, Tx>,
    client: ClientState,
}

type GlobalAppState = Arc<Mutex<AppState>>;

pub async fn start_server(config_directory_path: String) {
    let addr: String = "0.0.0.0:17001".to_string();

    let try_socket: Result<TcpListener, Error> = TcpListener::bind(addr).await;
    let listener: TcpListener = try_socket.expect("Failed to bind");

    let app_state = Arc::new(Mutex::new(AppState {
        peer_map: HashMap::new(),
        client: load_state(config_directory_path.clone()),
    }));

    while let Ok((socket, addr)) = listener.accept().await {

        println!("New WebSocket connection: {}", addr);

        tokio::spawn(websocket_process(
            app_state.clone(),
            socket,
            addr
        ));
    }
}


async fn websocket_process(app_state: GlobalAppState, socket: TcpStream, addr: SocketAddr) {
    let try_websocket = accept_async(socket).await;

    if let Err(e) = try_websocket {
        eprintln!("Error during the websocket handshake occurred: {}", e);
        return;
    }

    let websocket = try_websocket.unwrap();

    let (tx, rx) = unbounded();
    app_state.lock().unwrap().peer_map.insert(addr, tx);

    let (outgoing, incoming) = websocket.split();

    let broadcast_incoming = incoming.try_for_each(|message| {
        let try_json = serde_json::from_str::<ReceivedMessage>(&message.to_string());

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

        future::ok(())
    });

    let receive_from_others = rx.map(Ok).forward(outgoing);

    pin_mut!(broadcast_incoming, receive_from_others);
    future::select(broadcast_incoming, receive_from_others).await;

    app_state.lock().unwrap().peer_map.remove(&addr);
    println!("{} disconnected", addr);

}
