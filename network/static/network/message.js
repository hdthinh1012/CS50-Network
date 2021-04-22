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
        console.log(result);
        loadViews('profile-posts',default_page_id, user_id);
    })
    .catch()
}

function unFriendRequest(user_id, request_user_id){
    fetchUnFriendRequest(user_id, request_user_id)
    .then(result => {
        console.log(result);
        loadViews('profile-posts',default_page_id, user_id);
    })
    .catch()
}

function friendRequestReply(requestor_id, requested_id, is_accept){
    fetchFriendRequestReply(requestor_id, requested_id, is_accept)
    .then(result => {
        console.log(result);
        loadViews('all-posts',default_page_id);
        loadAllMessage();
    })
    .catch()
}

function chatBoxRequest(user_id, user, request_user_id, request_user){
    fetchChatBox(user_id, request_user_id)
    .then(result => {
        console.log(result);
        displayChatBox(result, user_id, user, request_user_id, request_user);
    })
    .catch()
}

