const default_page_id = 1;
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#post-stereotype').style.display = 'none';
    allEventListenser();
    loadViews('all-posts', default_page_id);
    loadAllMessage()
})
history.replaceState({id: null}, "", "")


/* Pop current state, event.state is the new current state left on stack having info passing when calling pushState
 */
window.addEventListener("popstate", event => {
    /* event is the previous event now to be showed, the event which is left on the top of the stack, not the one popped out of the stack
     */
    rollBackHistory(event);
})


/* page_id represents the index of paginator list, display the right page element, default_page_id = 1
 * kwargs: only one element, user_id in case of 'profile-posts', query_string in case of 'search-posts'
 */ 
function loadViews(type_post, page_id, ...kwargs){
    if(type_post == 'profile-posts'){
        while (document.querySelector("#profile-posts").firstChild) {
            document.querySelector("#profile-posts").firstChild.remove();
        }
        setStyleDisplay('none', 'none', 'none', 'block', 'block', 'none')
        let user_id = (kwargs.length == 0) ? document.querySelector('#request-user-id').value : kwargs[0];
        viewProfile(user_id);
        viewPosts(type_post, page_id, user_id);
        return false;
    }
    else if(type_post == 'search-posts'){
        while (document.querySelector("#search-posts").firstChild) {
            document.querySelector("#search-posts").firstChild.remove();
        }
        setStyleDisplay('none', 'none', 'none', 'none', 'none', 'block');
        viewSearch(page_id, kwargs[0]);
        return false;
    }
    else if(type_post == 'all-posts'){
        while (document.querySelector("#all-posts").firstChild) {
            document.querySelector("#all-posts").firstChild.remove();
        }
        setStyleDisplay('block', 'block', 'none', 'none', 'none', 'none');
    }
    else if(type_post == 'follow-posts'){
        while (document.querySelector("#follow-posts").firstChild) {
            document.querySelector("#follow-posts").firstChild.remove();
        }
        setStyleDisplay('none', 'none', 'block', 'none', 'none', 'none');
        document.querySelector('#follow-posts').style.display = 'block';
    }
    else{
        console.log("Wrong type post");
    }
    viewPosts(type_post, page_id);
}


function viewSearch(page_id, search_query){
    fetchSearchQuery(page_id, search_query) 
    .then(result => {
        let page_count = result.pop();
        let page_current = result.pop();
        setPaginator('search-posts', page_current, page_count, search_query);
        let query_div_list = document.querySelector("#search-posts");
        for (let query of result){
            if(query.hasOwnProperty('username')){
                user_query = createUserQuery(query);
                query_div_list.append(user_query);
            }
            else if (query.hasOwnProperty('title')){
                div_post = createPost(query, "all-posts", default_page_id);
                query_div_list.append(div_post);
            }
        }
    })
}


function viewProfile(user_id){
    /* Deleted all preloaded older user's profile posts for new user's profile posts */
    let parent = document.querySelector("#profile-posts");
    while (parent.firstChild) {
        parent.firstChild.remove();
    }

    /* Enable edit image button if request_user open request_user's profile page */
    let request_user_id = document.querySelector('#request-user-id').value;
    document.querySelector('.edit-user-image-btn').style.display = (request_user_id == user_id) ? 'block' : 'none';
    document.querySelector('.edit-user-image').style.display = 'none';
    document.querySelector('.edit-user-image-btn').onclick = () => {
        document.querySelector('.edit-user-image').style.display = 'block';
        document.querySelector('.edit-user-image-btn').style.display = 'none';
        document.querySelector('.edit-user-image').onsubmit = function(event){
            event.preventDefault();
            editUserImage(user_id);
        };
    };

    /* Fetch get user info in JSON format */
    fetchUserInfo(user_id)
    .then(user => {
        document.querySelector('.profile-username').innerHTML = `Username: ${user.username}`;
        document.querySelector('.profile-email').innerHTML = `Email: ${user.email}`;
        document.querySelector('.profile-follow').innerHTML = `Followed by ${user.followers.length} people, follow ${user.follow.length} people`;
        document.querySelector(".user-image").src = `${user.image_url}`;
 
        let request_user = document.querySelector('#request-user').value;
        let request_user_id = document.querySelector('#request-user-id').value;
        document.querySelector('.open-chat-btn').style.display = 'none';
        if(user.username == request_user){
            document.querySelector('.follow-user-btn').style.display = 'none';
            document.querySelector('.friend-request-btn').style.display = 'none';
        }
        /* Enable follow/unfollow button and friend/unfriend request/cancel request button in profile page that is not request_user's one */
        else{
            document.querySelector('.follow-user-btn').style.display = 'inline';
            document.querySelector('.follow-user-btn').innerHTML = (user.followers.includes(request_user)) ? "Unfollow" : "Follow";
            document.querySelector('.friend-request-btn').style.display = 'inline';
            let user_friends_username_list = user.friends.map(friend => friend.username);

            /* Enable open chat button if the request_user's username is in this user's friend list */
            if (user_friends_username_list.includes(request_user)){
                document.querySelector('.friend-request-btn').innerHTML = "Unfriend";
                document.querySelector('.open-chat-btn').style.display = 'inline';
            }
            else {
                console.log(user);
                document.querySelector('.friend-request-btn').innerHTML = (user.isFriendRequestSend) ? "Cancel Friend Request" : "Add Friend";
            }
            document.querySelector('.follow-user-btn').onclick = () => {
                window.history.pushState({id: '4', user_id}, "", "toggle.html")
                toggleFollow(user_id, request_user, user);
            };
            document.querySelector('.friend-request-btn').onclick = () => {
                window.history.pushState({id: '4', user_id}, "", "friend.html")
                if(user_friends_username_list.includes(request_user)) {
                    unFriendRequest(user_id, request_user_id);
                }
                else {
                    toggleFriendRequest(user_id, request_user_id, user.isFriendRequestSend);
                }
            }
            document.querySelector('.open-chat-btn').onclick = () => {
                chatBoxRequest(user_id, user.username, request_user_id, request_user);
            }
        }
    })
}


function viewPosts(type_post, page_id, ...user_id){
    posts_view = document.createElement('div');

    // Fetch get list of objects, each JSON hold info for one post, addition 2 paginator index and max_index at the end, for profile-post JSON need additional user_id 
    fetchPosts(type_post, page_id, ...user_id)
    .then(posts => {
        page_count = posts.pop();
        page_current = posts.pop();
        setPaginator(type_post, page_current, page_count, user_id);
        post_view = document.querySelector(`#${type_post}`);

        // Create list of posts append to chosen type_post 
        for (post of posts){
            let div_post = createPost(post, type_post, page_current);
            document.querySelector(`#${type_post}`).append(div_post);
        }
    })
}


// Add all comments into comment_views element, return for attaching to div_post
function addCommentViews(comment_views, post){
    let comment_generator = comment_views.querySelector('.comment-element');
    for (comment of post.comments){
        let new_comment = comment;
        let div_comment = comment_generator.cloneNode(true);
        div_comment.querySelector('.comment-header').innerHTML = `${new_comment.timestamp}, `;
        let commentor_link = document.createElement('span');
        commentor_link.classList.add('btn-link');
        commentor_link.innerHTML = `${new_comment.commentor}`;
        commentor_link.addEventListener('click', function(){
            window.history.pushState({id: '4', user_id: new_comment.commentor_id}, "", "profile.html")

            // Closure: 'new_comment' loop-scope, 'comment' function-scope changing every loop, affectiong all commentor_link.onclick
            loadViews('profile-posts' , default_page_id, parseInt(new_comment.commentor_id));
        })
        div_comment.querySelector('.comment-header').append(commentor_link);
        div_comment.querySelector('.comment-header').insertAdjacentHTML('beforeend', ' commented:');
        div_comment.querySelector('.comment-body').innerHTML = `${new_comment.content}`;
        comment_views.append(div_comment);
    }
    comment_views.firstElementChild.remove();
}