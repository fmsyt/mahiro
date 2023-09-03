use futures_util::StreamExt;
use tokio_tungstenite::accept_async;
use tokio::net::{TcpListener, TcpStream};

pub async fn start_server() {
    let addr = "0.0.0.0:8080".to_string();

    let try_socket = TcpListener::bind(&addr).await;
    let listener = try_socket.expect("Failed to bind");

    println!("Listening on: {}", addr);

    while let Ok((stream, _)) = listener.accept().await {
        tokio::spawn(accept_connection(stream));
    }
}

async fn accept_connection(stream: TcpStream) {
    let ws_stream = accept_async(stream).await.expect("Failed to accept");

    let (write, read) = ws_stream.split();

    if let Err(e) = read.forward(write).await {
        eprintln!("Error: {}", e);
    }
}
