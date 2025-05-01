import React, { useEffect, useState } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import { getData_Any2Column, addData, UpdateData } from "../service/APIService";
import { v4 as uuid } from "uuid";

const GroupChatModal = ({ show, onHide, groupId, loggedInUser }) => {
  const [chatData, setChatData] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchText, setSearchText] = useState("");

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

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    const newChat = {
      name: loggedInUser.name,
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
  };

  const filteredChats = chatData?.chats?.filter((chat) => !chat.isdeleted && chat.message.toLowerCase().includes(searchText.toLowerCase())) || [];

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Group Chat</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
        <InputGroup className="mb-1">
          <Form.Control type="text" className="w-75" placeholder="Search messages..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          <Button variant="outline-secondary" className="form-control" onClick={() => setSearchText("")}>
            Clear
          </Button>
        </InputGroup>

        {filteredChats.map((chat, idx) => (
          <div key={idx} className="mb-2">
            <strong>{chat.name}</strong>: {chat.message}
            <div className="text-muted" style={{ fontSize: "0.8em" }}>
              {new Date(chat.date).toLocaleString()}
            </div>
          </div>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Form.Control type="text" placeholder="Type your message" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} />
        <Button variant="primary" onClick={handleSend}>
          Send
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GroupChatModal;
