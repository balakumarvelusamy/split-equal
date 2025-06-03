import React, { useEffect, useState, useRef } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import { getData_Any2Column, addData } from "../service/APIService";
import { v4 as uuid } from "uuid";
import { generateClient } from "aws-amplify/api";
import { onNewMessage } from "../graphql/subscriptions";
import { sendMessage } from "../graphql/mutations";
import { FiSend } from "react-icons/fi";
import { FaTimes } from "react-icons/fa";
const client = generateClient();

const GroupChatModal = ({ show, onHide, groupId, loggedInUser }) => {
  const [chatData, setChatData] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!groupId || !show) return;

    const fetchChatData = async () => {
      const result = await getData_Any2Column("groupId", groupId, "type", "splitequal-groupchat");
      if (result.length > 0) {
        setChatData(result[0]);
        const jsonSizeInBytes = new Blob([JSON.stringify(result[0])]).size;
        console.log("Size in bytes:", jsonSizeInBytes);
        const sizeInKB = (jsonSizeInBytes / 1024).toFixed(2);
        console.log("json Size in KB:", sizeInKB);
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

    fetchChatData();

    const subscription = client
      .graphql({
        query: onNewMessage,
      })
      .subscribe({
        next: ({ data }) => {
          console.log("📨 Subscription triggered:", data);
          const newChat = data?.onNewMessage;
          if (newChat) {
            console.log("📨 New chat:", newChat);
            setChatData((prev) => ({
              ...prev,
              chats: [...(prev?.chats || []), newChat],
            }));
          }
        },
        error: (err) => {
          console.error("❌ Subscription error:", err);
        },
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [groupId, show]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatData?.chats, searchText]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);

    const chat = {
      name: loggedInUser.name,
      email: loggedInUser.email,
      message: newMessage.trim(),
      date: new Date().toISOString(),
      isdeleted: false,
      groupId: groupId,
    };

    try {
      await client.graphql({
        query: sendMessage,
        variables: {
          groupId,
          chat,
        },
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    }

    setNewMessage("");
    setSending(false);
  };

  const filteredChats = chatData?.chats?.filter((chat) => !chat?.isdeleted && chat?.message?.toLowerCase().includes(searchText.toLowerCase())) || [];

  return (
    <Modal show={show} onHide={onHide} Close className="pb-0 mb-0" size="lg">
      <Modal.Header className="p-2">
        <InputGroup className="mb-1">
          <Form.Control type="text" className="w-50 p-0 m-0 " style={{ height: "35px" }} placeholder="Search messages..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          <Button className="form-control1 px-2" style={{ height: "35px", padding: "2px" }} onClick={() => setSearchText("")}>
            Clear
          </Button>
        </InputGroup>
      </Modal.Header>
      <Modal.Body className="px-2 p-1 pb-0 border-none" style={{ maxHeight: "400px", minHeight: "400px", overflowY: "auto" }}>
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
      <Modal.Footer className="p-0 mt-0 "></Modal.Footer>
      <div>
        <div className="d-flex flex-grow-1 justify-content-end align-items-center gap-0 p-1">
          <InputGroup className="mb-0 pb-0">
            <Button variant="primary" className="px-1 form-control mb-0 mt-0" onClick={onHide}>
              <FaTimes />
            </Button>
            <Form.Control type="text" className="form-control w-50 mb-0 mt-0" placeholder="Type your message" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} />
            <Button variant="primary" className="form-control mb-0 mt-0" onClick={handleSend} disabled={sending}>
              {sending ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                </>
              ) : (
                <>
                  <FiSend className="me-1" />
                </>
              )}
            </Button>
          </InputGroup>
        </div>
      </div>
    </Modal>
  );
};

export default GroupChatModal;
