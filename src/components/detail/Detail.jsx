import { toast } from 'react-toastify';
import { useChatStore } from '../../lib/chatStore';
import { auth, db } from '../../lib/firebase'
import { useUserStore } from '../../lib/userStore';
import './detail.css'
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';


const Detail = () => {
    const {chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock} = 
    useChatStore();
    const {currentUser} = useUserStore();

    const handleBlock = async() => {
        if(!user) return;

        const userDocRef = doc(db, "users", currentUser.id);

        try{
            await updateDoc(userDocRef,{
                blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
            });
            changeBlock();
        }catch(err){
            toast.error(err);
        }
    }

    return(
        <div className="detail">
            <div className="user">
                <img src={user?.avatar || './avatar.png'} alt=""/>
                <h2>{user?.username}</h2>
                <p></p>
            </div>
            <div className="info">
                <button onClick={handleBlock}>
                    {isCurrentUserBlocked 
                    ? "Esta cuenta te ha bloqueado" 
                    : isReceiverBlocked 
                    ? "Usuario bloqueado" 
                    : "Bloquear Usuario"}
                </button>
                <button className='logout' onClick={() => auth.signOut()}>Cerrar Sesión</button>
            </div>
        </div>
    )
}

export default Detail