use futures_util::{StreamExt, SinkExt};
use tokio_tungstenite::{accept_async, tungstenite::Message};
use tokio::net::{TcpListener, TcpStream};

use crate::client::{ReceivedMessage, load_state, State as ClientState, SendWebSocketClientMessage, ReceiveWebSocketClientMessage};

pub async fn start_server(_config_directory_path: String) {
    let addr: String = "0.0.0.0:17001".to_string();

    let try_socket: Result<TcpListener, std::io::Error> = TcpListener::bind(addr).await;
    let listener: TcpListener = try_socket.expect("Failed to bind");

    while let Ok((socket, _addr)) = listener.accept().await {
        let client_state = load_state(_config_directory_path.clone());
        tokio::spawn(websocket_process(socket, client_state));
    }
}

async fn websocket_process(socket: TcpStream, client_state: ClientState) {
    let try_websocket = accept_async(socket).await;

    if let Err(e) = try_websocket {
        eprintln!("Error during the websocket handshake occurred: {}", e);
        return;
    }

    let websocket = try_websocket.unwrap();
    let (mut write, mut read) = websocket.split();

    while let Some(message) = read.next().await {

        if let Err(e) = message {
            eprintln!("Error during receive: {}", e);
            break;
        }

        if let Ok(Message::Text(text)) = message {

            if text == "" {
                continue;
            }

            if let Ok(message) = serde_json::from_str::<ReceivedMessage>(&text) {

                match message.method.as_str() {
                    "emit" => {

                        if let Some(data) = message.data {
                            if let Err(e) = client_state.emit(data.action, data.event, data.context, None) {
                                eprintln!("Error: {}", e);
                            }

                        } else {
                            eprintln!("Warn: Invalid emit message")
                        }

                    }
                    "general.update" => {
                    }
                    "sheets.update" => {
                        let message = client_state.sheets_update();
                        write.send(message).await.expect("Failed to send");
                    }
                    _ => {}
                }
            }
        }
    }

}
