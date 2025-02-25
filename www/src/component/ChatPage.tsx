"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
    Button,
    TextField,
    Card,
    CardContent,
    Typography,
    IconButton,
    CircularProgress,
    Box,
} from "@mui/material";
import { Upload, Send } from "@mui/icons-material";
import io from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
    transports: ["websocket", "polling"],
});

socket.on("connect", () => {
    console.log("Connected to WebSocket server");
});


interface FileItem {
    fileUrl: string;
    fileType: "image" | "video" | "document";
}

interface Message {
    id: string;
    sender: string;
    text: string;
    files: FileItem[]; // Đảm bảo files luôn là mảng FileItem[]
    createdAt: Date;
}
  
export default function ChatPage() {
    const [text, setText] = useState("");
    const [name, setName] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        // 🟢 GỌI API LẤY TIN NHẮN CŨ KHI VÀO CHAT
        const fetchMessages = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/messages/Room1`
                );
                if (response.ok) {
                    const oldMessages = await response.json();

                    setMessages(oldMessages);
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();

        // 🟢 NHẬN TIN NHẮN MỚI QUA WEBSOCKET
        socket.on("newMessage", (newMessage) => {
            setMessages((prevMessages) => [newMessage, ...prevMessages]);
        });

        return () => {
            socket.off("newMessage");
        };
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles([...files, ...Array.from(event.target.files)]);
        }
    };

    const handleSubmit = async () => {
        if (!text.trim() && files.length === 0) return;

        setLoading(true);
        const formData = new FormData();

        const getAnonymousName = () => `Anonymous - ${Date.now()}`;

        formData.append("sender", name?.trim() ? name : getAnonymousName());

        formData.append("room", "Room1");
        formData.append("text", text);
        files.forEach((file) => formData.append("files", file));

        // print formData
        for (const pair of formData.entries()) {
            console.log(pair[0] + ", " + pair[1]);
        }

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/send-message`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (response.ok) {
                const newMessage = await response.json();
                // socket.emit("sendMessage", newMessage);
                setMessages((prevMessages) => [newMessage, ...prevMessages]);
                setText("");
                setFiles([]);
                setName("");
            } else {
                const errorData = await response.json();
                alert(errorData.message);

                setFiles([])
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        const d = new Date(date);
        const now = new Date();

        const isToday =
            d.getDate() === now.getDate() &&
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear();

        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-based
        const year = d.getFullYear();

        return isToday
            ? `${hours}:${minutes}`
            : `${hours}:${minutes} ${day}/${month}/${year}`;
    };

    return (
        <Box
            sx={{
                p: 3,
                display: "flex",
                flexDirection: "row",
                gap: 3,
                width: "100%",
            }}
        >
            <Box sx={{ flex: 0.8, display: "flex", flexDirection: "column" }}>
                <Typography variant="h5" sx={{ mt: 2, mb: 4 }}>
                    Realtime Chat
                </Typography>

                <div className="flex items-center gap-2 my-4">
                    <TextField
                        sx={{ mb: 2 }}
                        label="Enter Your Name"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        type="file"
                        multiple
                        hidden
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />

                    <TextField
                        label="Enter message"
                        fullWidth
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <input
                        type="file"
                        multiple
                        hidden
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />

                    <Box sx={{ width: "100%", mt: 2 }}>
                        <IconButton
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload />
                        </IconButton>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <CircularProgress size={24} />
                            ) : (
                                <Send />
                            )}
                        </Button>
                    </Box>
                </div>

                {files.length > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                        {files.map((file, idx) => (
                            <Typography
                                key={idx}
                                variant="body2"
                                className="bg-gray-100 px-2 py-1 rounded"
                            >
                                {file.name}
                            </Typography>
                        ))}
                    </div>
                )}
            </Box>

            <Box
                sx={{
                    mt: 4,
                    columnGap: 3,
                    flex: 1,
                    maxHeight: "80vh",
                    overflowY: "auto",
                }}
            >
                {messages.map((msg, index) => (
                    <Card key={index} className="shadow-md">
                        <CardContent>
                            <Typography
                                variant="subtitle2"
                                className="text-gray-500"
                            >
                                {`${msg.sender} - ${formatDate(msg.createdAt)}`}
                            </Typography>
                            <Typography className="mt-1">{msg.text}</Typography>

                            {Array.isArray(msg.files) && msg.files.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {msg.files.map((file: FileItem, idx: number) => (
                                        <div key={idx} className="mt-2">
                                            {file.fileType === "image" ? (
                                                <Image
                                                    src={file.fileUrl}
                                                    alt="uploaded"
                                                    className="w-40 rounded-md shadow-md"
                                                />
                                            ) : file.fileType === "video" ? (
                                                <video
                                                    src={file.fileUrl}
                                                    controls
                                                    className="w-40 rounded-md shadow-md"
                                                />
                                            ) : (
                                                <a
                                                    href={file.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 underline"
                                                >
                                                    Download File
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Box>
    );
}
