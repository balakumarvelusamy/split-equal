import React, { useEffect, useState, useRef } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import { getData_Any2Column, addData, UpdateData } from "../service/APIService";
import { v4 as uuid } from "uuid";

const GroupChatModal = ({ show, onHide, groupId, loggedInUser }) => {
  const [chatData, setChatData] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  const fetchChatData = async () => {
    const result = await getData_Any2Column("groupId", groupId, "type", "splitequal-groupchat");
    if (result.length > 0) {
      setChatData(result[0]);
    } else {
      const newChat = {
        id: uuid(),
        groupId,
        chats: [],
        updatedDate: new Date().toISOString(),
        type: "splitequal-groupchat",
      };
      await addData(newChat);
      setChatData(newChat);
    }
  };

  useEffect(() => {
    if (show) fetchChatData();
  }, [show]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatData?.chats, searchText]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    const newChat = {
      name: loggedInUser.name,
      email: loggedInUser.email,
      message: newMessage.trim(),
      date: new Date().toISOString(),
      isdeleted: false,
    };
    const updated = {
      ...chatData,
      chats: [...chatData.chats, newChat],
      updatedDate: new Date().toISOString(),
    };
    await UpdateData(updated);
    setChatData(updated);
    setNewMessage("");
    setSending(false);
  };

  const filteredChats = chatData?.chats?.filter((chat) => !chat.isdeleted && chat.message.toLowerCase().includes(searchText.toLowerCase())) || [];

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header className="p-2">
        <InputGroup className="mb-1">
          <Form.Control type="text" className="w-50" placeholder="Search messages..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          <Button className="form-control" onClick={() => setSearchText("")}>
            Clear
          </Button>
        </InputGroup>
      </Modal.Header>
      <Modal.Body className="px-2 p-1" style={{ maxHeight: "400px", overflowY: "auto" }}>
        {filteredChats.map((chat, idx) => {
          const isOwnMessage = chat.email === loggedInUser.email;
          return (
            <div key={idx} className={`d-flex mb-2 ${isOwnMessage ? "justify-content-end" : "justify-content-start"}`}>
              <div className={`p-1 rounded ${isOwnMessage ? "myapp-bg-warning text-dark" : "bg-light text-dark"}`} style={{ maxWidth: "75%", wordBreak: "break-word" }}>
                <div>
                  <span className="fw-bold">{chat.name}: </span> <span>{chat.message}</span>
                </div>

                <div className="text-muted" style={{ fontSize: "0.65em" }}>
                  {new Date(chat.date).toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef}></div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between align-items-center w-100">
        <div className="d-flex flex-grow-1 justify-content-end align-items-center gap-1">
          <InputGroup className="mb-1">
            <Button variant="secondary" className="px-1 form-control" onClick={onHide}>
              Close
            </Button>
            <Form.Control type="text" className="form-control w-50" placeholder="Type your message" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} />
            <Button variant="primary" className="form-control" onClick={handleSend} disabled={sending}>
              {sending ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                </>
              ) : (
                "Send"
              )}
            </Button>
          </InputGroup>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default GroupChatModal;
