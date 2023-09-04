use futures_util::{StreamExt, SinkExt};
use tokio_tungstenite::{accept_async, tungstenite::Message};
use tokio::net::{TcpListener, TcpStream};

use crate::control::{Control, Sheet, self};

pub async fn start_server(config_file_path: String) {
    let addr: String = "0.0.0.0:8080".to_string();
    println!("Listening on: {}", addr);

    let try_socket: Result<TcpListener, std::io::Error> = TcpListener::bind(addr).await;
    let listener: TcpListener = try_socket.expect("Failed to bind");


    while let Ok((stream, _)) = listener.accept().await {
        let controls: Vec<Control> = control::load_controls(config_file_path.clone());
        let sheets: Vec<Sheet> = control::load_sheets(config_file_path.clone());

        tokio::spawn(handle_client(stream, controls, sheets));
    }
}

async fn handle_client(stream: TcpStream, _: Vec<Control>, _: Vec<Sheet>) {
    let ws_stream: tokio_tungstenite::WebSocketStream<TcpStream> = accept_async(stream).await.expect("Failed to accept");

    let (mut write, mut read) = ws_stream.split();

    while let Some(message) = read.next().await {
        println!("Received a message: {:?}", message);

        match message {
            Ok(Message::Text(text)) => {
                // メッセージを加工（大文字に変換）する例
                let response_text = text.to_uppercase();

                // 加工されたメッセージをクライアントに送信
                if let Err(e) = write.send(Message::Text(response_text)).await {
                    eprintln!("Failed to send response: {}", e);
                    break;
                }
            }
            Ok(_) => {
                // テキスト以外のメッセージは無視する（オプション）
            }
            Err(e) => {
                eprintln!("Error while handling message: {}", e);
                break;
            }
        }

    }

}
