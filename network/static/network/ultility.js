function allEventListenser() {
    // Use button toggle between section
    document.querySelector('#all-btn').addEventListener('click', () => {
        window.history.pushState({id: '1'}, "", "all.html")
        loadViews('all-posts', default_page_id);
    });
    document.querySelector('#follow-btn').addEventListener('click', () => {
        window.history.pushState({id: '2'}, "", "follow.html")
        loadViews('follow-posts', default_page_id);
    });
    document.querySelector('#profile-btn').addEventListener('click', () => {
        window.history.pushState({id: '3'}, "", "profile.html")
        loadViews('profile-posts', default_page_id);
    });
    loadPostForm();
    document.querySelector('#search-form').onsubmit = function(event){
        event.preventDefault();
        if(this.querySelector("#search-input").value === ""){
            console.log("No input string yet");
        }
        else {
            let search_query = this.querySelector("#search-input").value;
            window.history.pushState({id: '5', type_post:'search-posts', page_current: default_page_id, kwargs: search_query}, "", "search.html")
            this.querySelector("#search-input").value = "";
            loadViews('search-posts', default_page_id, search_query);
        }
    }
}


function setStyleDisplay(form_post, all_posts, follow_posts, profile_posts, profile_view, search_posts){
    document.querySelector('#form-post').style.display = form_post;
    document.querySelector('#all-posts').style.display = all_posts;
    document.querySelector('#follow-posts').style.display = follow_posts;
    document.querySelector('#profile-posts').style.display = profile_posts;
    document.querySelector('#profile-view').style.display = profile_view;
    document.querySelector('#search-posts').style.display = search_posts;
}


function rollBackHistory(event){
    let id = parseInt(event.state.id);
    if (id == 1){
        /* Roll back to after clikcing all-button event, means showing all posts
         */
        loadViews('all-posts', default_page_id);
    }
    else if(id == 2){
        /* Roll back to after clikcing all-button event, means showing posts of followed user
         */
        loadViews('follow-posts', default_page_id);
    }
    else if(id == 3){      
        /* Roll back to after clikcing profile-button event, means showing the request user profile page
         */                                     
        loadViews('profile-posts', default_page_id);
    }
    else if(id == 4){
        /* Roll back to after follow-button event, means showing the other user profile page
         */
        loadViews('profile-posts', default_page_id ,parseInt(event.state.user_id));
    }
    else if(id == 5){
        /* Roll back to after paginator-button event, means showing the page after clicking the previous/next button for all type of posts
         */
        if(event.state.kwargs){
            loadViews(event.state.type_post, event.state.page_current, event.state.kwargs);
        }
        else{
            loadViews(event.state.type_post, event.state.page_current);
        }
    }
    else if(id == 6){
        /* Roll back to after like-button event, means showing the same type-posts page, in the same page number
         */
        loadViews(event.state.type_post, event.state.page_current);
    }
    else{
        loadViews('all-posts', default_page_id);
    }
}


function loadPostForm(){
    document.querySelector('.form-group').addEventListener('submit', function(event){
        event.preventDefault();                                 
        let formdata = new FormData();
        formdata.append("title", document.querySelector("#title-form").value);
        formdata.append("content", document.querySelector("#content-form").value);
        formdata.append("image", document.querySelector("#image-form").files[0]);
        fetchCreatePost(formdata)     
        .then(result => {
            console.log(result);
            this.reset();
            // Fetch post create new Post element in database, reload all-posts views
            loadViews('all-posts', default_page_id);  
        }) 
    })
}


function createPost(post, type_post, page_current){
    let post_generator = document.querySelector('#post-stereotype').firstElementChild;
    // Create post element by cloning prewritten post blueprint in index.html
    let div_post = post_generator.cloneNode(true);
    addPostContent(div_post, post);
    user = document.querySelector('#request-user').value;
    div_post.querySelector(".post-edit-form").style.display = 'none';

    // Edit or comment form
    if (post.poster == user){
        div_post.querySelector('.comment-form').style.display = 'none';
        div_post.querySelector('.post-edit-btn').style.display = 'block';
        div_post.querySelector('.post-edit-btn').addEventListener('click', event => {
            editPostForm(event, div_post, post, type_post, page_current);
        })
    }
    else {
        div_post.querySelector('.comment-form').style.display = 'block';
        div_post.querySelector('.post-edit-form').style.display = 'none';
        div_post.querySelector('.post-edit-btn').style.display = 'none';
        div_post.querySelector('.comment-form').addEventListener('submit', event => {
            submitComment(event, div_post, post, type_post, page_current)
        })
    }

    // Like/Unlike btn and Comments views
    let likers = post.likes.map(like => like.liker);
    div_post.querySelector('.like-btn').innerHTML = (likers.includes(user)) ? "Unlike" : "Like";
    div_post.querySelector('.like-btn').onclick = function(event){
        window.history.pushState({id: '6', type_post, page_current}, "", "like.html");
        toggleLikes(event, type_post, post, likers.includes(user), page_current);
    }
    let comment_views = div_post.querySelector('.comment-views');
    addCommentViews(comment_views, post);

    // Post delete
    if (post.poster == user){
        div_post.querySelector(".delete-post-btn").style.display = "block";
        div_post.querySelector(".delete-post-btn").onclick = function(){
            fetchDeletePost(post)
            .then(result => {
                console.log(result);
                if(type_post == "profile-posts"){
                    loadViews(type_post, page_current, user.id);
                }
                else{
                    loadViews(type_post, page_current);
                }
            })
            .catch(error => {console.log(error)})
        }
    }
    return div_post;
} 


function editPostForm(evt, div_post, post, type_post, page_current){
    evt.currentTarget.remove();
    div_post.querySelector('.post-content').innerHTML = '';
    div_post.querySelector(".edit-content").value = `${post.content}`;
    div_post.querySelector('.post-edit-form').style.display = 'block';
    div_post.querySelector('.post-edit-form').addEventListener('submit', function(event){
        event.preventDefault();
        fetchEditPost(post, div_post)
        .then(result => {
            console.log(result);
            loadViews(`${type_post}`, page_current);
        })
    })
}


function addPostContent(div_post, post){
    div_post.querySelector(".post-title").innerHTML = `${post.title}`;
    div_post.querySelector(".post-content").innerHTML = `${post.content}`;
    console.log(post.poster_image_url);
    div_post.querySelector(".post-poster-image").src = `${post.poster_image_url}`;
    div_post.querySelector(".post-poster").innerHTML = `${post.poster}`;
    div_post.querySelector(".post-timestamp").innerHTML = `${post.timestamp}`;
    div_post.querySelector(".post-likes").innerHTML = `${post.likes.length} Liked`;
    div_post.querySelector(".post-image").src = `${post.image_url}`;
    div_post.querySelector(".post-poster").addEventListener('click', function(){
        let user_id = parseInt(post.poster_id);
        window.history.pushState({id: '4', user_id}, "", "profile.html");
        loadViews('profile-posts', default_page_id, user_id);
    })
}


// Create profile div element for display search result
function createUserQuery(user){
    let profile_generator = document.querySelector("#profile-element-generator").firstElementChild;
    let profile = profile_generator.cloneNode(true);
    profile.querySelector('.profile-username').innerHTML = `${user.username}`;
    profile.querySelector('.profile-email').innerHTML = `Email: ${user.email}`;
    profile.querySelector(".profile-follow").innerHTML = `Followed by ${user.followers.length} people, follow ${user.follow.length} people`;
    profile.querySelector(".user-image").src = `${user.image_url}`;
    profile.querySelector('.profile-username').onclick = () => {
        window.history.pushState({id: '4', user_id: user.id}, "", "profile.html");
        loadViews('profile-posts', default_page_id, user.id)
    };
    return profile;
}


function submitComment(evt, div_post, post, type_post, page_current){
    evt.preventDefault();
    fetchSubmitComment(post, div_post)
    .then(result => {
        console.log(result);
        loadViews(`${type_post}`, page_current);
    })
}


/*Set onclick attribue for paginator buttons to change page list
 * kwargs[0] could be user_id for 'profile-posts' or query_search for 'search-posts'
 */
function setPaginator(type_post, page_current, page_count, ...kwargs){
    if (page_current >= page_count){
        document.querySelector("#next-page").classList.add("disabled");
        document.querySelector("#next-page").onclick = '';
    }
    else{
        /* Click next-page btn load next post-list in paginator list */
        const next_page = page_current + 1;
        document.querySelector("#next-page").classList.remove("disabled");
        if(kwargs.length == 0){
            document.querySelector("#next-page").onclick = () => {
                /* history.pushState() pushes the state of the incoming page in application, so that when back button is clicked, 
                 * the page above it is poped out and this event (now is located at the top of the stack) is retrieved and display
                 */      
                window.history.pushState({id: '5', type_post, page_current: next_page}, "", "page.html");
                loadViews(type_post, next_page);        
            };
        }
        else{
            document.querySelector("#next-page").onclick = () => {
                window.history.pushState({id: '5', type_post, page_current: next_page, kwargs}, "", "page.html");
                loadViews(type_post, next_page, kwargs);
            };
        }
    }
    if(page_current <= 1){
        document.querySelector("#previous-page").classList.add("disabled");
        document.querySelector("#previous-page").onclick = '';
    }
    else{
        // Click previous-page btn load previous post-list in paginator list
        const previous_page = page_current - 1;
        document.querySelector("#previous-page").classList.remove("disabled");
        if(kwargs.length == 0){
            document.querySelector("#previous-page").onclick = () => {
                window.history.pushState({id: '5', type_post, page_current: previous_page}, "", "page.html");
                loadViews(type_post, previous_page);
            };
        }
        else{
            document.querySelector("#previous-page").onclick = () => {
                window.history.pushState({id: '5', type_post, page_current: previous_page, kwargs}, "", "page.html");
                loadViews(type_post, previous_page, kwargs);
            };
        }
    }
}


function editUserImage(user_id){
    let imageField = document.querySelector(".image-input-fetch");
    let formdata = new FormData();
    console.log(imageField.files[0]);
    formdata.append("image", imageField.files[0]);
    fetchEditUserImage(formdata)
    .then(result => {
        console.log(result);
        loadViews('profile-posts', default_page_id, user_id);
    })
}


function toggleFollow(user_id, request_user, user){
    fetchToggleFollow(user_id, user, request_user)
    .then(result => {
        console.log(result);
        loadViews("profile-posts", default_page_id, user_id);
    })
}


function toggleLikes(event, type_post, post, is_liked, page_current){
    event.preventDefault();
    fetchToggleLikes(post, is_liked)
    .then(result => {
        console.log(result);
        loadViews(type_post, page_current);
    })
}

function displayChatBox(chat_box_info, user_id, user, request_user_id, request_user){
    let chatbox = document.querySelector("#chat-bubble");
    let chatbody = chatbox.querySelector(".chat-body");

    chatbox.classList.remove("d-none");
    chatbox.querySelector(".user-status-info").innerHTML = `${user}`;
    let request_user_message_div = document.querySelector(".sender-request-user");
    
    // Clear old chat body
    while(chatbody.firstChild){
        chatbody.firstChild.remove();
    }
    let other_message_div = document.querySelector(".sender-other");
    let messages = chat_box_info['messages'].reverse();
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

    // User type and submit chat in chatbox forms
    chatbox.querySelector(".chat-form").onsubmit = function(event){
        event.preventDefault();
        fetchSendMessage(user_id, request_user_id, chatbox)
        .then(result => {
            console.log(result);
            document.querySelector("#chat-bubble").classList.remove("d-none");
            displayChatBox(result, user_id, user, request_user_id, request_user);
            this.reset();
        })
        .catch()
    }
}