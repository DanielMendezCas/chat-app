import { useEffect, useRef, useState } from 'react';
import './chat.css';
import EmojiPicker from 'emoji-picker-react';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { toast } from 'react-toastify';
import { useUserStore } from '../../lib/userStore';
import upload from '../../lib/upload';

const Chat = () => {
    const [open, setOpen] = useState(false);
    const [chat, setChat] = useState();
    const [text, setText] = useState("");
    const [img, setImg] = useState({
        file: null,
        url: "",
    });
    const [cameraOpen, setCameraOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioFile, setAudioFile] = useState(null);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
    const { currentUser } = useUserStore();

    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
            setChat(res.data());
        });

        return () => {
            unSub();
        };
    }, [chatId]);

    const handleEmoji = (e) => {
        setText(prev => prev + e.emoji);
        setOpen(true);
    };

    const handleImg = e => {
        if (e.target.files[0]) {
            setImg({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            });
        }
    };

    const handleSend = async () => {
        if (text === "" && !img.file && !audioFile) return;

        let imgUrl = null;
        let audioUrl = null;

        try {
            if (img.file) {
                imgUrl = await upload(img.file);
            }

            if (audioFile) {
                audioUrl = await upload(audioFile);
            }

            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text,
                    createdAt: new Date(),
                    ...(imgUrl && { img: imgUrl }),
                    ...(audioUrl && { audio: audioUrl }),
                }),
            });

            const userIDs = [currentUser.id, user.id];

            userIDs.forEach(async (id) => {
                const userChatsRef = doc(db, "userchats", id);
                const userChatsSnapshot = await getDoc(userChatsRef);

                if (userChatsSnapshot.exists()) {
                    const userChatsData = userChatsSnapshot.data();
                    const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId);

                    userChatsData.chats[chatIndex].lastMessage = text || "Mensaje de voz";
                    userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
                    userChatsData.chats[chatIndex].updatedAt = Date.now();

                    await updateDoc(userChatsRef, {
                        chats: userChatsData.chats,
                    });
                }
            });

        } catch (err) {
            toast.error(err);
        }

        setImg({
            file: null,
            url: "",
        });
        setAudioFile(null);
        setText("");
    };

    const handleCameraClick = () => {
        setCameraOpen(true);
        startCamera();
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            toast.error("Error al acceder a la cámara");
            console.error("Error accessing camera: ", err);
        }
    };

    const handleCapture = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                setImg({
                    file: blob,
                    url: URL.createObjectURL(blob),
                });
                stopCamera();
            });
            setCameraOpen(false);
        }
    };

    const stopCamera = () => {
        const video = videoRef.current;
        if (video && video.srcObject) {
            const stream = video.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
        }
    };

    const handleMicClick = async () => {
        if (isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        } else {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = event => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                setAudioFile(audioBlob);
                audioChunksRef.current = [];
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
        }
    };

    return (
        <div className="chat">
            <div className="top">
                <div className="user">
                    <img src={user?.avatar || './avatar.png'} alt="" />
                    <div className="texts">
                        <span>{user?.username}</span>
                        <p></p>
                    </div>
                </div>
                <div className="icons">
                    <img src='./phone.png' alt='' />
                    <img src="./video.png" alt="" />
                    <img src="./info.png" alt="" />
                </div>
            </div>
            <div className="center">
                {chat?.messages?.map(message => (
                    <div className={message.senderId === currentUser?.id ? "message own" : "message"}
                        key={message?.createAt}>
                        <div className="texts">
                            {message.img &&
                                <img src={message.img} alt="" />
                            }
                            {message.audio &&
                                <audio controls>
                                    <source src={message.audio} type="audio/wav" />
                                    Tu navegador no soporta la reproducción de audio.
                                </audio>
                            }
                            <p>{message.text}</p>
                        </div>
                    </div>
                ))
                }
                {img.url && (
                    <div className="message own">
                        <div className="texts">
                            <img src={img.url} alt="" />
                        </div>
                    </div>
                )}
                {audioFile && (
                    <div className="message own">
                        <div className="texts">
                            <audio controls>
                                <source src={URL.createObjectURL(audioFile)} type="audio/wav" />
                                Tu navegador no soporta la reproducción de audio.
                            </audio>
                        </div>
                    </div>
                )}
                <div ref={endRef}></div>
            </div>
            <div className="bottom">
                <div className="icons">
                    <label htmlFor="file">
                        <img src='./img.png' alt='' />
                    </label>
                    <input type="file" id='file' style={{ display: "none" }} onChange={handleImg} />
                    <img src="./camera.png" alt="" onClick={handleCameraClick} />
                    <img src="./mic.png" alt="" onClick={handleMicClick} />
                </div>
                <input
                    type="text"
                    value={text}
                    placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? "No puedes enviar más mensajes"
                        : 'Escribe un mensaje...'}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isCurrentUserBlocked || isReceiverBlocked}
                />
                <div className="emoji">
                    <img
                        src="./emoji.png"
                        alt=""
                        onClick={() => setOpen((prev) => !prev)}
                    />
                    <div className="picker">
                        <EmojiPicker open={open} onEmojiClick={handleEmoji} />
                    </div>
                </div>
                <button className='sendButton' onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>
                    Enviar
                </button>
            </div>

            {cameraOpen && (
                <div className="camera-modal">
                    <video ref={videoRef} autoPlay></video>
                    <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                    <button onClick={handleCapture}>Capturar</button>
                    <button onClick={() => setCameraOpen(false)}>Cerrar</button>
                </div>
            )}
        </div>
    );
};

export default Chat;

