const apiUrl = "https://taggram.herokuapp.com";

var currentUser;
var comments = [];
var post;
var related = [];

function changeUser(){
    const $username = document.getElementById("current-user-username");
    const $avatar = document.getElementById("current-user-avatar");
    $username.innerHTML = currentUser.username;
    if (currentUser.avatar) {
      $avatar.style.backgroundImage = "url('" + currentUser.avatar + "')";
    }
  } 

  
  function changePost(){
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
    comments = post.comments;
    var commentsHTML = "";
    var avatar;
    var postedAt;
    var likesText = "";
    
    console.log(comments);  
   
    for(let i = 0; i < comments.length; i++)
    {        
      if(comments[i].user.avatar)
        avatar = comments[i].user.avatar;
      else
        avatar = "assets/images/NoPhoto.jpg";
  
      if(comments[i].created_at.length == 24){
        // seleção da diferença de horários
        var date = new Date(comments[i].created_at);
        postedAt = convertDate(date);
      }
      else 
        postedAt = comments[i].created_at;
  
        
      likesText = "";
    if(comments[i].like_count > 0)
    {
      likesText = comments[i].like_count + (comments[i].like_count > 1 || comments[i].like_count == 0  ? ' curtidas' : ' curtida');
    }
    commentsHTML += 
   `<div class="comment" id="comment${i}">
       <div class="comment__avatar" id="comment-avatar" style="background-image: url('${avatar}')"></div>
       <div class="comment__info">
         <div class="comment__header">
           <p class="comment__text" id="comment-text"><span class="user__name" id="comment-username">${comments[i].user.username} </span>${comments[i].message}</p>
         </div>
         <div class="comment__footer">
           <p class="commented__at">${postedAt}</p>
           <p class="likes" id="likes-number${i}">${likesText}</p>
         </div>                  
       </div>
       <i class="heart__icon material-icons" id="heart-icon" onclick="likeIconClick(this, ${i}) ">favorite_border</i>
   </div>`;
   }
   $commentsList.innerHTML = commentsHTML;
  }
  
  function changeRelated(){
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

  function changeCommentInfo(index, element){
    console.log(comments);
    if(element.innerHTML == 'favorite_border')
    {
      element.innerHTML = 'favorite';
      element.style.color = 'red';
      const $likesNumber = document.getElementById('likes-number' + index);
      
      $likesNumber.innerHTML = comments[index].like_count == 1 ? comments[index].like_count + ' curtida' : comments[index].like_count + ' curtidas';
        
    }
    else{
      element.innerHTML = 'favorite_border';
      element.style.color = 'black';
      const $likesNumber = document.getElementById('likes-number' + index);

      $likesNumber.innerHTML = '';
      if(comments[index].like_count > 0)
        $likesNumber.innerHTML = comments[index].like_count == 1 ? comments[index].like_count + ' curtida' : comments[index].like_count + ' curtidas';
    }
  } 
  
  function likeIconClick(element, index){
    var commentId = comments[index].uuid;
    if(element.innerHTML == 'favorite_border')
    {
      likeUnlikeComment(commentId, element, index, 'like');
    }
    else{
      likeUnlikeComment(commentId, element, index, 'unlike');
    }
  }

const getMe = () => {
    axios.get(apiUrl + '/me').then(response => {
        currentUser = response.data;
        changeUser();

        getPost();
    });
}

const getPost = () => {
    axios.get(apiUrl + "/post?username=" + currentUser.username).then(response => {
        post = response.data;
        changePost();
        
        getRelated();        
    });
}

const getRelated = () => {
    axios.get(apiUrl + "/posts/" + post.uuid + "/related").then(response => {
      related = response.data;
      changeRelated();      
    });
}

const likeUnlikeComment = (commentId, heartIcon, commentIndex, action) => {
  axios.post(apiUrl + "/comments/" + commentId + '/' + action, {username: currentUser.username}).then(response => {
    if(response.status == 200)
    {
      comments[commentIndex] = response.data;
      changeCommentInfo(commentIndex, heartIcon, action);
    }
  }).catch(err => {
    if(err != 200)
        window.alert('Não foi possível ' + (action == 'like' ? 'curtir' : 'descurtir') +
        ' a publicação!\nTente novamente mais tarde.');
});
}



function init() {
    getMe()
  }
  

init();

