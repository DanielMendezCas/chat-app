import { auth } from '../../lib/firebase'
import './detail.css'


const Detail = () => {
    return(
        <div className="detail">
            <div className="user">
                <img src="./avatar.png" alt=""/>
                <h2>Lazaro</h2>
                <p>Ocupado...</p>
            </div>
            <div className="info">
                <div className="option">
                    <div className="title">
                        <span>Configuración del Chat</span>
                        <img src="./arrowUp.png" alt="" />
                    </div>
                </div>
                <div className="option">
                    <div className="title">
                        <span>Ayuda y Privacidad</span>
                        <img src="./arrowUp.png" alt="" />
                    </div>
                </div>
                <div className="option">
                    <div className="title">
                        <span>Fotos Compartidas</span>
                        <img src="./arrowDown.png" alt="" />
                    </div>
                    <div className="photos">
                        <div className="photoItem">
                            <div className="photoDetail">
                                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPS95LdXWR22i6aJPrRlHHAN5OIjHIUhmQQ-hOiX7Gpg&s" alt="" />
                                <span>photo_2024.png</span>
                            </div>
                            <img src="./download.png" alt="" className="icon"/>
                        </div>
                        <div className="photoItem">
                            <div className="photoDetail">
                                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPS95LdXWR22i6aJPrRlHHAN5OIjHIUhmQQ-hOiX7Gpg&s" alt="" />
                                <span>photo_2024.png</span>
                            </div>
                            <img src="./download.png" alt="" className="icon"/>
                        </div>
                        <div className="photoItem">
                            <div className="photoDetail">
                                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPS95LdXWR22i6aJPrRlHHAN5OIjHIUhmQQ-hOiX7Gpg&s" alt="" />
                                <span>photo_2024.png</span>
                            </div>
                            <img src="./download.png" alt="" className="icon"/>
                        </div>
                        <div className="photoItem">
                            <div className="photoDetail">
                                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPS95LdXWR22i6aJPrRlHHAN5OIjHIUhmQQ-hOiX7Gpg&s" alt="" />
                                <span>photo_2024.png</span>
                            </div>
                            <img src="./download.png" alt="" className="icon"/>
                        </div>
                    </div>
                </div>
                <div className="option">
                    <div className="title">
                        <span>Archivos Compartidos</span>
                        <img src="./arrowUp.png" alt="" />
                    </div>
                </div>
                <button>Bloquear Usuario</button>
                <button className='logout' onClick={() => auth.signOut()}>Cerrar Sesión</button>
            </div>
        </div>
    )
}

export default Detail