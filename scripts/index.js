function changeUser(username, avatar){
  const $username = document.getElementById("current-user-username");
  const $avatar = document.getElementById("current-user-avatar");

  $username.innerHTML = username;
  if (avatar) {
    $avatar.style.backgroundImage = "url('" + avatar + "')";
  }
} 

function changePost(post){
  const $postImage = document.getElementById("post-image");
  const $userAvatar = document.getElementById("who-posted-avatar")
  const $username = document.getElementById("who-posted-username")
  const $userLocation = document.getElementById("who-posted-location");
  const $commentsNumber = document.getElementById("comments-number");
  const $createdAt = document.getElementById("created-at");
  const $commentsList = document.getElementById("comments-list");

  // Informações do post        
  if(post.user.avatar){            
    $userAvatar.style.backgroundImage = "url('" + post.user.avatar + "')";
  }
  $username.textContent = post.user.username;
  $userLocation.textContent = post.location.city + ", " + post.location.country;
  $postImage.src = post.photo;
  $commentsNumber.textContent = post.comments.length + " comentários";
  $createdAt.textContent = post.created_at;

  // Lista de comentários
  var comments = post.comments;
  var commentsHTML = "";
  var avatar;
  var postedAt;
  var likesText = "";
 
  for(let i = 0; i < comments.length; i++)
  {        
    if(comments[i].user.avatar)
      avatar = comments[i].user.avatar;
    else
      avatar = "/assets/images/NoPhoto.jpg";

    if(comments[i].created_at.length == 24){
      // seleção da diferença de horários
      var date = new Date(comments[i].created_at);
      postedAt = convertDate(date);
    }
    else 
      postedAt = comments[i].created_at;

  if(comments[i].like_count > 0)
  {
    likesText = comments[i].like_count + (comments[i].like_count > 1 || comments[i].like_count == 0  ? ' curtidas' : ' curtida');
  }
  commentsHTML += 
 `<div class="comment">
     <div class="comment__avatar" id="comment-avatar" style="background-image: url('${avatar}')"></div>
     <div class="comment__info">
       <div class="comment__header">
         <p class="comment__text" id="comment-text"><span class="user__name" id="comment-username">${comments[i].user.username} </span>${comments[i].message}</p>
       </div>
       <div class="comment__footer">
         <p class="commented__at">${postedAt}</p>
         <p class="likes" id="likes-number">${likesText}</p>
       </div>                  
     </div>
     <i class="heart__icon material-icons" id="heart-icon">favorite_border</i>
 </div>`;
 }
 $commentsList.innerHTML = commentsHTML;
}

function changeRelated(related){
  var relatedPostsHTML = "";
      

  for(let i = 0; i < related.length; i++)
  {
    if(related[i].comment_count >= 3) 
      relatedPostsHTML += "<div class='related__post' style='background-image: url(" + related[i].photo + ")'></div>";
  }


  const $relatedContainer = document.getElementById('posts-container');

  $relatedContainer.innerHTML = relatedPostsHTML;
}

function convertDate(date){
  var now = Date.now();
  var diffMilissegundos = now - date;  
  var diffSegundos = diffMilissegundos / 1000;
  var postedAt = parseInt(diffSegundos) + "s";
  if(diffSegundos >= 60){
    var diffMinutos = diffSegundos / 60;
    postedAt = parseInt(diffMinutos) + "m";
    if(diffMinutos >= 60){
      var diffHoras = diffMinutos / 60;
      postedAt = parseInt(diffHoras) + "h";
      if(diffHoras >= 24){         
        var diffDias = diffHoras / 24;
        postedAt = parseInt(diffDias) + "d";
      }
    }
  }

  return postedAt;  
}

(function(apiUrl) {

  function getMe() {
    return fetch(apiUrl + "/me")
      .then(function(response) {
        return response.json();
      })
      .then(function(user) {        
        changeUser(user.username, user.avatar);

        getPost(user.username);
      });
  } 

  function getPost(username){
      return fetch (apiUrl + "/post?username=" + username)
      .then(function(response) {
          return response.json();
      })
      .then(function(post) {
        changePost(post);
        
        getRelated(post.uuid);        
      });
  }

  function getRelated(postId){
    return fetch (apiUrl + "/posts/" + postId + "/related")
    .then(function(response) {
        return response.json();
    })
    .then(function(related) {
      changeRelated(related);
    });
}

  function initialize() {
    getMe();
  }

  initialize();
})("https://taggram.herokuapp.com");