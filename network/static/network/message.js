function loadAllMessage(){
    while(document.querySelector('.message-col').firstChild){
        document.querySelector('.message-col').firstChild.remove();
    }
    while(document.querySelector('.friend-list').firstChild){
        document.querySelector('.friend-list').firstChild.remove();
    }
    document.querySelector("#chat-bubble").classList.add("d-none");
    loadFriendRequest();
}

function loadFriendRequest(){
    let request_user_id = document.querySelector('#request-user-id').value;
    fetchUserInfo(request_user_id)
    .then(user => {
        friendRequests = user.friend_request_received;
        for (friendRequest of friendRequests){
            let friend_request_div = createFriendRequestDiv(friendRequest);
            console.log(friend_request_div);
            document.querySelector('.message-col').append(friend_request_div);
        }

        for(friend of user.friends){
            let div_friend = document.createElement("span");
            div_friend.classList.add("btn-link")
            div_friend.innerHTML = `${friend.username}`;
            let friend_id = friend.id;
            div_friend.onclick = () => {
                loadViews("profile-posts", default_page_id, friend_id);
            }
            document.querySelector('.friend-list').append(div_friend);
            document.querySelector('.friend-list').append(document.createElement("br")); 
        }
    })
}

function createFriendRequestDiv(friendRequest){
    let div_request_generator = document.querySelector(".friend-request-message");
    let div_friend_request = div_request_generator.cloneNode(true);
    div_friend_request.querySelector(".message-content").innerHTML = `${friendRequest.requestor} sends you a friend request`;
    div_friend_request.querySelector(".accept-request-btn").onclick = () => {
        friendRequestReply(friendRequest.requestor_id, friendRequest.requested_id, true);
    };
    div_friend_request.querySelector(".decline-request-btn").onclick = () => {
        friendRequestReply(friendRequest.requestor_id, friendRequest.requested_id, false);
    };
    div_friend_request.classList.remove('d-none');
    return div_friend_request;
}

function toggleFriendRequest(user_id, request_user_id, isFriendRequestSend){
    fetchToggleFriendRequest(user_id, request_user_id, isFriendRequestSend)
    .then(result => {
        loadViews('profile-posts',default_page_id, user_id);
    })
    .catch()
}

function unFriendRequest(user_id, request_user_id){
    fetchUnFriendRequest(user_id, request_user_id)
    .then(result => {
        loadViews('profile-posts',default_page_id, user_id);
    })
    .catch()
}

function friendRequestReply(requestor_id, requested_id, is_accept){
    fetchFriendRequestReply(requestor_id, requested_id, is_accept)
    .then(result => {
        loadViews('all-posts',default_page_id);
        loadAllMessage();
    })
    .catch()
}

function chatBoxRequest(user_id, user, request_user_id, request_user){
    fetchChatBox(user_id, request_user_id)
    .then(result => {
        displayChatBox(result, user_id, user, request_user_id, request_user);
    })
    .catch()
}

function displayChatBox(chat_box_info, user_id, user, request_user_id, request_user){
    
    let chatbox = document.querySelector("#chat-bubble");

    chatbox.classList.remove("d-none");
    chatbox.querySelector(".user-status-info").innerHTML = `${user}`;

    let messages_list = chat_box_info['messages'].reverse(); 
    chatBoxSetup(messages_list, user_id, user, request_user_id, request_user);
    
}

function chatBoxSetup(messages, user_id, user, request_user_id, request_user){
    const user_1_id = (user_id < request_user_id) ? user_id : request_user_id;
    const user_2_id = (user_id > request_user_id) ? user_id : request_user_id;
    const connectionString = 'ws://' + window.location.host + '/ws/chat/' + user_1_id + '/' + user_2_id + '/';
    const chatSocket = new WebSocket(connectionString);

    let chatbox = document.querySelector("#chat-bubble");

    chatbox.classList.remove("d-none");
    chatbox.querySelector(".user-status-info").innerHTML = `${user}`;

    /* e contains newest incoming message from either the current user or the other one
     */
    chatSocket.onopen = function open() {
        console.log('WebSockets connection created.');
        /* on websocket open, send the START event.
         */
        displayChatMessage(messages, user_id, user, request_user_id, request_user);
    };

    chatSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        const incoming_message = data["chat_info"]; 
        messages.push(incoming_message);
        console.log(messages.length);
        if (messages.length > 10){
            messages.shift();
        }
        displayChatMessage(messages, user_id, user, request_user_id, request_user)
    };
    
    chatSocket.onclose = function(e) {
        console.error('Chat socket closed unexpectedly');
    };
    
    /* User type and submit chat in chatbox forms.
     * request_user is the sender user
     */
    chatbox.querySelector(".chat-form").onsubmit = function(event){
        event.preventDefault();
        const messageInputDom = document.querySelector('.chat-content');
        const message = messageInputDom.value;
        console.log(request_user_id, user_id);
        chatSocket.send(JSON.stringify({
            'sender_id': request_user_id,
            'receiver_id': user_id,
            'content': message
        }));
        this.reset();
    }
}

function displayChatMessage(messages, user_id, user, request_user_id, request_user){
    let chatbox = document.querySelector("#chat-bubble");
    let request_user_message_div = document.querySelector(".sender-request-user");
    let other_message_div = document.querySelector(".sender-other");
    let chatbody = chatbox.querySelector(".chat-body");
    /* Clear old chat body 
     */
    while(chatbody.firstChild){
        chatbody.firstChild.remove();
    }
    for (let message of messages){                                      
        if (message.user == request_user){
            let user_message = request_user_message_div.cloneNode(true);
            user_message.classList.remove("d-none");
            user_message.querySelector(".my-message").innerHTML = `${message.content}`;
            chatbody.append(user_message);
        }
        else{
            let other_message = other_message_div.cloneNode(true);
            other_message.classList.remove("d-none");
            other_message.querySelector(".other-message").innerHTML = `${message.content}`;
            chatbody.append(other_message);
        }
    }
}