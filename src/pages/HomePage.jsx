import { nanoid } from 'nanoid';
import React, { useState, useEffect } from 'react'
import { io } from 'socket.io-client';

const socket = io("http://localhost:5000");
const HomePage = () => {
  const [registered, setRegistered] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [roomID, setRoomID] = useState("");
  const [userName, setUserName] = useState("");
  const [onError, setError] = useState(false);
  const [userID, setUserID] = useState("");
  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMessages((messages) => [...messages, data]);
      const element = document.getElementById('chatbox');
      if(element){
        console.log("in if");
        element.scroll({ top: element.scrollHeight, behavior: "smooth"})
      }
    });
  }, [socket]);
  const sendMessage = (e) => {
    e.preventDefault();
    if(userMessage != ""){
      try {
        socket.emit("sendMessage", { message: userMessage, userName: userName, userID, roomID });
        setUserMessage("");
        const element = document.getElementById('chatbox');
        if(element){
          console.log("in if");
          element.scroll({ top: element.scrollHeight, behavior: "smooth"})
        }

      } catch (e) {
        console.log(e);
      }
    }
  };
  const registerUser = (e) => {
    e.preventDefault();
    if (userName != "" && roomID != "") {
      try {
        const newUserId = nanoid();
        setUserID(newUserId);
        socket.emit("join", { userName, roomID, userID: newUserId });
        setRegistered(true);
      } catch (e) {
        alert("error try again")
      }
    }
  }
  return (
    <div className='h-screen w-screen flex justify-center items-center'>
      <div className="container flex flex-col mx-auto justify-center items-center sm:w-2/6">
        {!registered ? <>  <div className="shadow-lg h-80 w-[20rem] sm:w-80 flex flex-col items-center justify-center">
          <form onSubmit={registerUser}
            className='flex flex-col justify-center items-center'
          >
            <p>User Name</p>
            <input
              className="outline-none border border-teal-600 rounded py-0.5 px-1"
              type="text"
              value={userName}
              onChange={(e) => {
                if (userName != "") {
                  setError(false);
                }
                else {
                  setError(true);
                }
                setUserName(e.target.value)
              }}
            />
            {
              onError ? <>
                <p className="text-red-500" >Please enter user name</p>
              </> : <></>
            }
            <p className="text-center">Room ID</p>
            <input type="text" value={roomID}
              className="outline-none border border-teal-600 rounded py-0.5 px-1"
              onChange={(e) => {
                setRoomID(e.target.value);
              }} />
            <button type="submit"
              className="mt-2 bg-teal-400 text-white px-2 py-0.5 outline-none"
            >Submit</button>
          </form>
        </div> </> : <>
          <div className="container w-[90%] sm:w-full p-4 shadow-lg">
            <div className="flex justify-between px-3 pt-4 ">
              <div className="flex  h-10 w-full bg-black text-white rounded-lg justify-evenly items-center">
                <div className="text-bold">Room ID  : {roomID} </div>
                <div className="text-blue-50">User Name : {userName} </div>
              </div>
            </div>
            <div className="overflow-y-auto h-96 my-2" id="chatbox" >
              {messages.map((o) => {
                return (
                  <div className={o.userID === userID ? "flex flex-col items-end" : "flex flex-col items-start"} key={Math.random()}>
                    <div className={o.userID === userID ? 'flex flex-row-reverse': 'flex'}>
                   {
                    o.userID === userID ? <></> :  <span className="text-xs pr-[4px]">{o.userName}</span>
                   }
                    <span className='text-xs'>
                      {new Date().toLocaleTimeString(
                        "en-US",
                        {
                          hour: "numeric",
                          minute: "numeric",
                        }
                      )}
                    </span>
                    </div>
                    <div className={o.userID === userID ? "rounded text-white py-1 px-1 w-fit my-1 bg-black" : "rounded text-white py-1 px-1 w-fit my-1 bg-black"}>
                      {o.message}
                    </div>
                    
                  </div>
                );
              })}
            </div>
            <div className="flex mr-2">
              <form className= "w-full flex justify-between" onSubmit ={sendMessage}>
              <input
                type="text"
                className="shadow-lg px-1.5 py-2 border w-full border-black rounded"
                value={userMessage}
                onChange={(e) => {
                  setUserMessage(e.target.value);
                }}
              />
              <button
                className="ml-4 bg-black text-white rounded px-2"
                type='submit'
              >send</button>
              </form>
            </div>
          </div>
        </>}
      </div>
    </div>
  )
}

export default HomePage;