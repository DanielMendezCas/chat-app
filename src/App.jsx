import Chat from './components/chat/Chat';
import List from './components/list/List';
import Detail from './components/detail/Detail';
import Login from './components/login/Login';
import Notificaction from './components/notification/Notitication';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useUserStore } from './lib/userStore';
import { useChatStore } from './lib/chatStore';

const App = () => {

  const {currentUser, isLoading, fetchUserInfo} = useUserStore();
  const {chatId} = useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () =>{
      unSub();
    }

  },[fetchUserInfo]);

  console.log(currentUser);

  if(isLoading) return <div className='loading'>Cargando...</div>


  return (
    <div className='container-app'>
      {
        currentUser ? (
      <>
      <List/>
      {chatId && <Chat/>}
      {chatId && <Detail/>}
      </>
        ) : (<Login/>)
     }
     <Notificaction/>
    </div>
  )
}

export default App;