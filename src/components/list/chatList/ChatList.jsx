import { useEffect, useState } from 'react';
import './chatList.css';
import AddUser from './addUser/addUser';
import { useUserStore } from '../../../lib/userStore';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useChatStore } from '../../../lib/chatStore';
import { toast } from 'react-toastify';

const ChatList = () => {
  const [addMode, setAddMode] = useState(false);
  const [chats, setChats] = useState([]);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    if (!currentUser || !currentUser.id) return; // Asegura que currentUser y su ID están definidos

    const userChatsRef = doc(db, "userchats", currentUser.id);

    const unSub = onSnapshot(userChatsRef, async (resp) => {
      if (!resp.exists()) {
        console.error("No such document!");
        return;
      }

      const items = resp.data().chats;

      const promises = items.map(async (item) => {
        const userDocRef = doc(db, "users", item.receiverId);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          console.error("No such user document!");
          return { ...item, user: {} };
        }

        const user = userDocSnap.data();
        return { ...item, user };
      });

      const chatData = await Promise.all(promises);
      setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
    });

    return () => {
      unSub();
    }
  }, [currentUser]);

  const handleSelect = async (chat) => {
    const userChats = chats.map(item => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex((item) => item.chatId === chat.chatId);

    if (chatIndex !== -1) {
      userChats[chatIndex].isSeen = true;

      const userChatsRef = doc(db, "userchats", currentUser.id);

      try {
        await updateDoc(userChatsRef, {
          chats: userChats,
        });
        changeChat(chat.chatId, chat.user);
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  const filteredChats = chats.filter((c) =>
    c.user?.username?.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className='chatList'>
      <div className="search">
        <div className="searchBar">
          <img src='./search.png' alt='' />
          <input type="text" placeholder='Buscar' onChange={(e) => setInput(e.target.value)} />
        </div>
        <img src={addMode ? "./minus.png" : './plus.png'} alt='' className='add'
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>
      {filteredChats.map((chat) => (
        <div className="item" key={chat.chatId} onClick={() => handleSelect(chat)}
          style={{
            backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
          }}>
          <img src={chat.user?.blocked?.includes(currentUser.id) 
            ? "./avatar.png" 
            : chat.user?.avatar || './avatar.png'} alt=''
          />
          <div className="text">
            <span>{chat.user?.blocked?.includes(currentUser.id) 
              ? "Usuario" 
              : chat.user?.username}
            </span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}

      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
