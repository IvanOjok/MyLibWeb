import { initializeApp } from '@firebase/app';
import { getDatabase, onValue, ref as ref_database, set } from '@firebase/database';
import { getAuth, signInWithEmailAndPassword } from '@firebase/auth';
import { getStorage, ref as ref_storage, uploadBytesResumable, getDownloadURL } from '@firebase/storage';
import jqueryMin, * as $ from "./jquery.min.js";

const firebaseConfig = {
    apiKey: "AIzaSyDC1oUf_sq7V0TmRc5kAuIWEnz53X6lyQQ",
    authDomain: "my-lib-project-46754.firebaseapp.com",
    databaseURL: "https://my-lib-project-46754.firebaseio.com",
    projectId: "my-lib-project-46754",
    storageBucket: "my-lib-project-46754.appspot.com",
    messagingSenderId: "515480162438",
    appId: "1:515480162438:web:17b9650768d7a5c7e58107"
};

//initialize app
const app = initializeApp(firebaseConfig)


//signing into the app
const auth = getAuth(app)
window.signIn = function () {
  
    var email = document.getElementById("email");
    var password = document.getElementById("password");
    const promise = signInWithEmailAndPassword(
              auth, email.value, password.value);
              promise.then((userCredential) =>{
                  const user =userCredential.user;
                  window.location.href = 'books.html';
              })
              .catch((e) => alert(e.message));
  }

//initialize services
const db = getDatabase(app)

//Get Book
let list = document.getElementById("myList");
window.getBooks = function () {
  const dbRef = ref_database(getDatabase(), 'book');

  onValue(dbRef, (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const key = childSnapshot.key;
      const data = childSnapshot.val();
      

      const bookRef = ref_database(getDatabase(), 'book/' + key);
      onValue(bookRef, (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          let li = document.createElement("li");
          li.innerText = childSnapshot.key;
          li.value = childSnapshot.key;
          
          list.appendChild(li)
          // const bookT = childSnapshot.key;
          // alert(bookT);
        })
      });
    });
  }, {
    onlyOnce: true
  });
}

//get storage reference
const storage = getStorage(app, "gs://my-lib-project-46754.appspot.com");
var downloadURL = ""  

  var bookUrl = document.getElementById("bookUrl");
  bookUrl.onchange = e => {
    var file = e.target.files[0];
    var filename = e.target.files[0].name;

    const bookImageRef = ref_storage(storage, 'book-images/'+ filename);
  
    const uploadTask = uploadBytesResumable(bookImageRef, file);
  
  uploadTask.on('state_changed', 
  (snapshot) => {
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
    switch (snapshot.state) {
      case 'paused':
        console.log('Upload is paused');
        break;
      case 'running':
        console.log('Upload is running');
        break;
    }
  }, 
  (error) => {
    // Handle unsuccessful uploads
    console.log("File Upload failed", error);
  }, 
  async () => {
    // Handle successful uploads on complete
    downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
  //   .then((downloadURL) => {
  //     console.log('File available at', downloadURL);
  //     downloadURL = downloadURL;
      
  //   });
  });
  
  }

  //add Book
  window.addBookFun = function() {
    var bookClass = document.getElementById("bookClass");
    var bookTitle = document.getElementById("bookTitle");
    var bookSubject = document.getElementById("bookSubject");
    var bookDescription = document.getElementById("bookDescription");
    var bookColor = document.getElementById("bookColor");
    var bookPrice = document.getElementById("bookPrice");
    var lessons = document.getElementById("lessons");
    var topics = document.getElementById("topics");
    
    const bookRef = ref_database(getDatabase(), 'book/'+ bookClass.value + '/' + bookTitle.value);
    set(bookRef, {
      bookTitle: bookTitle.value,
      bookClass: bookClass.value,
      bookSubject : bookSubject.value,
      bookDescription: bookDescription.value,
      bookColor: bookColor.value,
      bookPrice: bookPrice.value,
      lessons: lessons.value,
      topics: topics.value,
      bookUrl: downloadURL
    })
    .then(() => {
      alert("Book uploaded successfully");
      window.location.href = 'books.html';
    })
    .catch((error) => {
      console.log(error);
      alert("Upload failed");
    });
  }

  //load Books
  let booklist = document.getElementById("bookTitleselect");
window.loadBooks = function () {
  alert("YES");
  const dbRef = ref_database(getDatabase(), 'book');

  onValue(dbRef, (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const key = childSnapshot.key;
      const data = childSnapshot.val();
      

      const bookRef = ref_database(getDatabase(), 'book/' + key);
      onValue(bookRef, (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          let option = document.createElement("option");
          option.innerText = childSnapshot.key;
          option.value = childSnapshot.key;
          console.log(childSnapshot.key)
          booklist.appendChild(option);
        })
      });
    });
  }, {
    onlyOnce: true
  });
}

$(function () {
  alert();
})