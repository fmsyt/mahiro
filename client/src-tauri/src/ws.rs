use futures_util::{StreamExt, SinkExt};
use tokio_tungstenite::{accept_async, tungstenite::Message};
use tokio::net::{TcpListener, TcpStream};

use crate::client::{ReceivedMessage, load_state, State as ClientState, SendWebSocketClientMessage};

pub async fn start_server(_config_directory_path: String) {
    let addr: String = "0.0.0.0:8080".to_string();
    println!("Listening on: {}", addr);

    let try_socket: Result<TcpListener, std::io::Error> = TcpListener::bind(addr).await;
    let listener: TcpListener = try_socket.expect("Failed to bind");

    while let Ok((stream, _)) = listener.accept().await {
        let client_state = load_state(_config_directory_path.clone());
        tokio::spawn(handle_client(stream, client_state));
    }
}

async fn handle_client(stream: TcpStream, client_state: ClientState) {
    let ws_stream: tokio_tungstenite::WebSocketStream<TcpStream> = accept_async(stream).await.expect("Failed to accept");

    let (mut write, mut read) = ws_stream.split();



    while let Some(message) = read.next().await {

        if let Err(e) = message {
            eprintln!("Error during receive: {}", e);
            break;
        }

        if let Ok(Message::Text(text)) = message {

            if text == "" {
                continue;
            }

            println!("Received a text message: {:?}", text);

            if let Ok(message) = serde_json::from_str::<ReceivedMessage>(&text) {
                println!("message: {:?}", message);

                match message.method.as_str() {
                    "emit" => {

                        if let Some(data) = message.data {
                            println!("data: {:?}", data);

                            if let Ok(control_file_path) = base64::decode(data.control_id) {
                                println!("control_id: {:?}", control_file_path);
                            }

                        } else {
                            eprintln!("Warn: Invalid emit message")
                        }

                    }
                    "general.update" => {
                        println!("general.update");
                    }
                    "sheets.update" => {
                        println!("sheets.update");
                        let message = client_state.sheets_update();
                        write.send(message).await.expect("Failed to send");
                    }
                    _ => {}
                }
            }
        }
    }

}
