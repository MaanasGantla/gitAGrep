import React, { useEffect, useState, useCallback } from 'react';
import { Container, Grid, List, ListItem, ListItemAvatar, Avatar, Typography, Divider, TextField, Button } from '@mui/material';
import Endpoints from '../Endpoints';
import { Snackbar } from '@mui/material';
import { BoldText } from '../Components/BoldText';
import { BlueButton } from '../Components/BlueButton';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

// const contacts = [
//   { id: 1, name: 'maanas', avatar: 'https://via.placeholder.com/50' },
//   { id: 2, name: 'sohan', avatar: 'https://via.placeholder.com/50' },
// ];

// const messages = [
//   { id: 1, senderId: 1, content: 'Hello!', timestamp: '9:00 AM' },
//   { id: 2, senderId: 2, content: 'Hi there!', timestamp: '9:05 AM' },
// ];

export function DirectMessaging({ setLoggedIn }) {
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [snackbarText, setSnackbarText]  = useState('');
  const [open, setOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState(contacts[0]?._id);
  const [socket, setSocket] = useState(null);
  let myId = '';


  const navigate = useNavigate();


  const getExchangesForUser = () => {
    Endpoints.doGetExchangesByUser().then(response => {
      if(!response.ok) {
          throw "Response Failure"
      }
      return response.json();
      }).then(json => {
          setContacts(json);
      }).catch(e => {
          console.log(e);
          setSnackbarText("Unable to fetch exchanges");
          setOpen(true);
      });
  }

  const getMessagesForUser = (contactId) => {
    Endpoints.doGetMessages(contactId).then(response => {
      if(!response.ok) {
          throw "Response Failure"
      }
      return response.json();
    }).then(json => {
        setMessages(json);
        console.log(json);
    }).catch(e => {
        console.log(e);
        setSnackbarText("Unable to fetch messages");
    });
  }

  useEffect(() => {
    getExchangesForUser();
    Endpoints.doGetSelf(setLoggedIn).then(async (response) => {
      const json = await response.json();
      if(!response.ok) {
          throw json;
      }
      return json;
    }).then(json => {
        myId = json["_id"];
    }).catch(e => {
        //Do Nothing
    }).then(() => {
    console.log(myId);
    const socket = io(process.env.REACT_APP_BACKEND_URL, {
      query: {
        userId: myId
      }
    });
    setSocket(socket);

    return () => socket.close()
  });
  }, [])

  useEffect(() => {
    socket?.on("message", (newMessage) => {
      console.log(newMessage)
      if (newMessage.exchangeID.toString() == selectedContactId) {
        getMessagesForUser(selectedContactId);
      }
    })
  }, [socket, selectedContactId, messages, contacts])

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!text) {
      setSnackbarText("Please type something to send!");
      setOpen(true);
      return;
    }
    console.log(selectedContactId);
    Endpoints.doSendMessage(selectedContactId, text).then(async (response) => {
        if(!response.ok) {
          const json = await response.json();
          throw json;
        }
        return response.json();
    }).then(async (json) => {
      console.log(json);
      document.getElementById("messagebox").value = '';
      setText('');
      setMessages([...messages,json]);
    }).catch(e => {
      setSnackbarText(e["reason"] || "Internal Server Error");
      setOpen(true);
    });
  }

  const handleContactClick = (contactId) => {
    setSelectedContactId(contactId);
    getMessagesForUser(contactId);
  };
  
  function getExchangeButtons() {
    if(!selectedContactId) {
      return;
    }

    const curExchange = contacts.find(contact => contact._id === selectedContactId);
    if(!curExchange) {
      setSelectedContactId(null);
      return;
    }
    if(curExchange.role != 1 && curExchange.role != 2) {
      setSnackbarText("Malformed Exchange Data");
      setOpen(true);
      return;
    }

    if(curExchange.role == 1) {
      if(!curExchange.acceptedTwo) {
        return (
          <BoldText text={"Waiting for Other Participant to Accept Exchange"}/>
        );
      }
      else if(!curExchange.acceptedOne) {
        return (
          <BlueButton text={"Accept Selected Book"} onClick={acceptOne}/>
        );
      }
    }
    else if(curExchange.role == 2) {
      if(!curExchange.acceptedTwo) {
        return (
          <BlueButton text="Select Book to Exchange With" onClick = {acceptTwo}/>
        );
      }
      else if(!curExchange.acceptedOne) {
        return (
          <BoldText text={"Waiting for Other Participant to Accept Selected Book"}/>
        );
      }
    }
    
    if((curExchange.exchangeStatus & curExchange.role) == 0) {
      return (
        <BlueButton text={"Confirm Exchange Performed"} onClick={confirmExchange}/>
      );
    }
    else if(curExchange.exchangeStatus != 3) {
      return (
        <BoldText text={"Waiting for Other Participant to Confirm Exchange Performed"}/>
      );
    }
    else if((curExchange.readStatus & curExchange.role) == 0) {
      return (<BlueButton text={"Finished Reading Book"} onClick={confirmRead}/>);
    }
    else if(curExchange.readStatus != 3) {
      return (
        <BoldText text={"Waiting for Other Participant to Finish Reading Book"}/>
      );
    }
    else if((curExchange.reexchangeStatus & curExchange.role) == 0) {
      return (<BlueButton text={"Confirm Book Retrieval"} onClick={confirmReexchange}/>);
    }
    else if(curExchange.reexchangeStatus != 3) {
      return (
        <BoldText text={"Waiting for Other Participant to Confirm Book Retrieval"}/>
      );
    }
    else {
      return (
        <BoldText text={"Exchange Complete"}/>
      );
    }
    
  }

  function getExchangeStateJSX() {
    if(!selectedContactId) {
      return null;
    }

    const curExchange = contacts.find(contact => contact._id === selectedContactId);
    if(!curExchange) {
      setSelectedContactId(null);
      return null;
    }

    let otherBook = (curExchange.role == 1) ? curExchange.bookOne : curExchange.bookTwo;
    let myBook = (curExchange.role == 1) ? curExchange.bookTwo : curExchange.bookOne;

    return (
      <>
        <BoldText text={"My Book: "+(myBook ? myBook.title : "Unselected")}/>
        {myBook ? <BlueButton text={"View"} onClick={() => {navigate("/BookInformation/"+myBook._id)}}/> : null}
        <BoldText text={"Borrowed Book: "+(otherBook ? otherBook.title : "Unselected")}/>
        {myBook ? <BlueButton text={"View"} onClick={() => {navigate("/BookInformation/"+otherBook._id)}}/> : null}
        <BlueButton text={"Cancel Exchange"} onClick={cancelExchange}/>
      </>
    );

  }

  function getOtherUser() {
    return contacts.find(contact => contact._id === selectedContactId)?.user
  }

  //Exchange State Change Functions
  const exchangeStateChange = (func) => {

    if(!selectedContactId) {
      return;
    }

    return func(selectedContactId, setLoggedIn).then(async (response) => {
      const json = await response.json();
      if(!response.ok) {
        throw json;
      }
      return json;
    }).then(json => {
      setSnackbarText("Success");
      setOpen(true);
    }).catch(e => {
      console.log(e);
      setSnackbarText(e["reason"] || "Unable to Perform Action");
      setOpen(true);
    });
  }
  const acceptOne = () => {
    exchangeStateChange(Endpoints.doAcceptOneExchange).then(() => {
      getExchangesForUser();
    });
  }
  const acceptTwo = () => {
    if(!selectedContactId) return;
    const curExchange = contacts.find(contact => contact._id === selectedContactId);
    if(!curExchange) {
      setSnackbarText("Malformed Exchange Data");
      setOpen(true);
      return null;
    }
    navigate('/UserBooks/'+curExchange.user._id+'?exchange='+curExchange._id);
    
  }
  const confirmExchange = () => {
    exchangeStateChange(Endpoints.doConfirmExchange).then(() => {
      getExchangesForUser();
    });
  }
  const confirmRead = () => {
    exchangeStateChange(Endpoints.doConfirmRead).then(() => {
      getExchangesForUser();
    });
  }
  const confirmReexchange = () => {
    exchangeStateChange(Endpoints.doConfirmReexchange).then(() => {
      getExchangesForUser();
    });
  }
  const cancelExchange = () => {
    exchangeStateChange(Endpoints.doCancelExchange).then(() => {
      setSelectedContactId(null);
      getExchangesForUser();
    });
  }


  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <List>
            {contacts.map(contact => (
              <ListItem
                key={contact._id}
                button
                selected={contact._id === selectedContactId}
                onClick={() => handleContactClick(contact._id)}
              >
                <ListItemAvatar>
                  <Avatar alt={contact?.user.username} src={contact?.avatar} />
                </ListItemAvatar>
                <Typography variant="subtitle1">{contact?.user.username}</Typography>
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={8}>
          <Typography variant="h5">Conversation with {getOtherUser()?.username}</Typography>
          <Divider />
          <div style={{ height: '400px', overflowY: 'scroll', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
            {messages.map(message => (
              <div key={message.id} style={{ textAlign: message.senderID._id === getOtherUser()?._id ? 'left' : 'right', marginBottom: '10px' }}>
                <Typography variant="body1" style={{ display: 'inline-block', backgroundColor: message.senderID._id === getOtherUser()?._id ? '#e6e6e6' : '#2979ff', padding: '8px', borderRadius: '8px', color: message.senderId === selectedContactId ? '#333' : '#fff' }}>{message.content}</Typography>
                <Typography variant="caption" style={{ display: 'block', textAlign: message.senderID._id === getOtherUser()?._id ? 'left' : 'right', marginTop: '5px', color: '#666' }}>{message.createdAt}</Typography>
              </div>
            ))}
          </div>
          <Divider style={{ margin: '20px 0' }} />
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={10}>
              <TextField fullWidth id="messagebox" placeholder="Type your message..." variant="outlined" onChange={(e) => setText(e.target.value)} />
            </Grid>
            <Grid item xs={2}>
              <Button variant="contained" color="primary" fullWidth onClick={handleSubmit}>Send</Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {getExchangeStateJSX()}
      {getExchangeButtons()}
      <Snackbar
                    open={open}
                    autoHideDuration={60000}
                    onClose={() => setOpen(false)}
                    message={snackbarText}
                />
    </Container>
  );
}




/*
export function DirectMessaging(){
    return(
        <>
            <h1> This is the direct messaging page. </h1>
        </>
    )
}
*/