import { initializeApp } from '@firebase/app';
import { getDatabase, onValue, ref as ref_database, set, child, push } from '@firebase/database';
import { getAuth, signInWithEmailAndPassword } from '@firebase/auth';
import { getStorage, ref as ref_storage, uploadBytesResumable, getDownloadURL } from '@firebase/storage';


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

//get storage reference
const storage = getStorage(app, "gs://my-lib-project-46754.appspot.com");


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
var array = [];
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
          array.push(childSnapshot.key);
          let li = document.createElement("li");
          li.innerText = childSnapshot.key;
          li.value = childSnapshot.key;
          
          list.appendChild(li)

          console.log(array);
          // const bookT = childSnapshot.key;
          // alert(bookT);
        })
      });
    });
  }, {
    onlyOnce: true
  });
}


//upload and add books
var bookfilename = ""
var bookfile = new File([""], "bookname");
var bookdownloadURL = "";  
  var bookUrl = document.getElementById("bookUrl");
  window.uploadBookImage = e => {
    bookfile = e.target.files[0];
    bookfilename = e.target.files[0].name;
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

    const bookImageRef = ref_storage(storage, 'book-images/'+ bookfilename);
    const uploadTask = uploadBytesResumable(bookImageRef, bookfile);
  
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
  () => {
    // Handle successful uploads on complete
    getDownloadURL(uploadTask.snapshot.ref)
    .then((y) => {
      console.log('File available at', y);
      bookdownloadURL = y;

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
        bookUrl: bookdownloadURL
      })
      .then(() => {
        alert("Book uploaded successfully");
        window.location.href = 'books.html';
      })
      .catch((error) => {
        console.log(error);
        alert("Upload failed");
      });
      
    });
  }
  );
    

  }


  //load available books
  window.loadBooks = function () {
    var bookTitle = document.getElementById('bookTitle');
    const dbRef = ref_database(getDatabase(), 'book');
  
    onValue(dbRef, (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key;
        const data = childSnapshot.val();
        
  
        const bookRef = ref_database(getDatabase(), 'book/' + key);
        onValue(bookRef, (snapshot) => {
          snapshot.forEach((childSnapshot) => {
            var childkey = childSnapshot.key;
            let option = document.createElement("option");
            option.innerText = childkey;
            option.value = childkey;
            bookTitle.appendChild(option);

            //get book relevant information
            const bookInfo = ref_database(getDatabase(), 'book/' + key + '/' + childkey);
            onValue(bookInfo, (snap) => {
              console.log(snap.val().bookTitle)
              //snap.forEach((data) => {
               // console.log(data);
              //   for(key in data) {
              //     if(data.hasOwnProperty(key)) {
              //         var value = data[key];
              //         console.log(value);
              //     }
              // }
              //})
            })
          })
        });
      });
    }, {
      onlyOnce: true
    });
  }
  
  //upload term information
  var termURL = "";
  var termfilename = "";
  var termfile = new File([""], "filename");
  var termIcon = document.getElementById("termIcon");
  window.uploadTermFile = f => {
     termfile = f.target.files[0];
     termfilename = f.target.files[0].name;
    console.log(termfile);
  }
  
  
  window.addTermFun = function () {

    var bookTitle = document.getElementById("bookTitle");
    var termTitle = document.getElementById("termTitle");
    var termPrice = document.getElementById("termPrice");
    var lessons = document.getElementById("lessons");
    var topics = document.getElementById("topics");

    var bookClass = "";
    var bookUrl = "";


    const dbRef = ref_database(getDatabase(), 'book');
  
    onValue(dbRef, (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key;
  
        const bookRef = ref_database(getDatabase(), 'book/' + key + '/' + bookTitle.value);
        onValue(bookRef, (snapshot) => {
          bookClass = snapshot.val().bookClass;
          bookUrl = snapshot.val().bookUrl;
        });
      });
    }, {
      onlyOnce: true
    });


    const termImageRef = ref_storage(storage, 'term-images/'+ termfilename);
    const uploadTask = uploadBytesResumable(termImageRef, termfile);
  
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
  () => {
     getDownloadURL(uploadTask.snapshot.ref).then(x => {
      termURL = x;

      const termRef = ref_database(getDatabase(), 'terms/'+ bookTitle.value + '/' + termTitle.value);
      set(termRef, {
        bookTitle: bookTitle.value,
        bookClass: bookClass,
        bookUrl, bookUrl,
        termTitle: termTitle.value,
        termPrice : termPrice.value,
        lessons: lessons.value,
        topics: topics.value,
        termIcon: termURL
      })
      .then(() => {
        console.log("success");
        alert("Term uploaded successfully");
        window.location.href = 'books.html';
      })
      .catch((error) => {
        console.log(error);
        alert("Upload failed");
      });
    });
  }
  );
  
  }


  //upload a topic
  var topicURL = "";
  var topicfilename = "";
  var topicfile = new File([""], "filname");
  var topicIcon = document.getElementById("topicIcon");
  window.uploadTopicFile = g => {
    topicfile = g.target.files[0];
     topicfilename = g.target.files[0].name;
  }
  
  window.addTopicFun = function () {

    var bookTitle = document.getElementById("bookTitle");
    var termTitle = document.getElementById("termTitle");
    var topicTitle = document.getElementById("topicTitle");
    var topicTheme = document.getElementById("topicTheme");

    var bookClass = "";
    var bookUrl = "";

    const dbRef = ref_database(getDatabase(), 'book');
  
    onValue(dbRef, (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key;
  
        const bookRef = ref_database(getDatabase(), 'book/' + key + '/' + bookTitle.value);
        onValue(bookRef, (snapshot) => {
          bookClass = snapshot.val().bookClass;
          bookUrl = snapshot.val().bookUrl;
        });
      });
    }, {
      onlyOnce: true
    });


    const topicImageRef = ref_storage(storage, 'topic-images/'+ topicfilename);
    const uploadTask = uploadBytesResumable(topicImageRef, topicfile);
  
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
  () => {
     getDownloadURL(uploadTask.snapshot.ref).then(x => {
      topicURL = x;

      const topicRef = ref_database(getDatabase(), 'topic/'+ bookTitle.value + '/' + termTitle.value + '/' + topicTitle.value);
      set(topicRef, {
        bookTitle: bookTitle.value,
        bookClass: bookClass,
        termTitle: termTitle.value,
        topicTheme: topicTheme.value,
        topicTitle: topicTitle.value,
        topicIcon: topicURL
      })
      .then(() => {
        console.log("success");
        alert("Term uploaded successfully");
        window.location.href = 'books.html';
      })
      .catch((error) => {
        console.log(error);
        alert("Upload failed");
      });
    });
  }
  );
  
  }

 
  //load for lessons
  window.loadLessonBooks = function () {
    var bookTitle = document.getElementById('bookTitle');
    var bookTerm = document.getElementById('bookTerm');
    var topicTitle = document.getElementById('topicTitle');
    const dbRef = ref_database(getDatabase(), 'topic');
  
    onValue(dbRef, (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key;
        const data = childSnapshot.val();

        var childkey = childSnapshot.key;
            let option = document.createElement("option");
            option.innerText = childkey;
            option.value = childkey;
            bookTitle.appendChild(option);
  
        const bookRef = ref_database(getDatabase(), 'topic/' + key);
        onValue(bookRef, (snapshot) => {
          snapshot.forEach((childSnapshot) => {
            console.log(childSnapshot);
            var termkey = childSnapshot.key;
            let termoption = document.createElement("option");
            termoption.innerText = termkey;
            termoption.value = termkey;
            bookTerm.appendChild(termoption);

            //get book relevant information
            const bookInfo = ref_database(getDatabase(), 'topic/' + key + '/' + termkey);
            onValue(bookInfo, (snap) => {
              console.log(snap.val().bookTitle)
              snap.forEach((data) => {
               console.log(data);
               var topickey = data.key;
               let topicoption = document.createElement("option");
               topicoption.innerText = topickey;
               topicoption.value = topickey;
               topicTitle.appendChild(topicoption);
                
              })
            })
          })
        });
      });
    }, {
      onlyOnce: true
    });
  }

  ///add lessons
    //upload a topic
    var lessonURL = "";
    var lessonfilename = "";
    var lessonfile = new File([""], "filname");
    var lessonIcon = document.getElementById("topicIcon");
    window.uploadLessonImage = h => {
      lessonfile = h.target.files[0];
      lessonfilename = h.target.files[0].name;
    }

  window.addLessonFun = function (){
    var caption = ""
    var bookTitle = document.getElementById('bookTitle');
    var bookTerm = document.getElementById('bookTerm');
    var topicTitle = document.getElementById('topicTitle');

    var lessonTitle = document.getElementById("lessonTitle");
    var sectionTitle = document.getElementById("sectionTitle");
    //var lessonMedia = document.getElementById("lessonMedia");
    var lessonContent = document.getElementById("lessonContent");
    var mediaType = document.getElementById("mediaType");
    var mediaCaption = document.getElementById("mediaCaption");

    var bookClass = "";
    var bookUrl = "";

    const dbRef = ref_database(getDatabase(), 'book');
  
    onValue(dbRef, (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key;
  
        const bookRef = ref_database(getDatabase(), 'book/' + key + '/' + bookTitle.value);
        onValue(bookRef, (snapshot) => {
          bookClass = snapshot.val().bookClass;
          bookUrl = snapshot.val().bookUrl;
        });
      });
    }, {
      onlyOnce: true
    });

    const lessonImageRef = ref_storage(storage, 'lesson-images/'+ lessonfilename);
    const uploadTask = uploadBytesResumable(lessonImageRef, lessonfile);
  
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
  () => {
     getDownloadURL(uploadTask.snapshot.ref).then(x => {

    if(mediaType.value == "none"){
      lessonURL = "none";
      caption = "none"; 
    }
    else{
      lessonURL = x;
      caption = mediaCaption.value;
    }
      

      var secKey = push(child(ref_database(getDatabase()), 'lesson/' + bookTitle.value + '/' + bookTerm.value + '/' + topicTitle.value + '/' + lessonTitle.value)).key;
      const lessonRef = ref_database(getDatabase(), 'lesson/' + bookTitle.value + '/' + bookTerm.value + '/' + topicTitle.value + '/' + lessonTitle.value + '/' + secKey);
      set(lessonRef, {
        bookTitle: bookTitle.value,
        bookClass: bookClass,
        termTitle: bookTerm.value,
        topicTitle: topicTitle.value,
        lessonTitle: sectionTitle.value,
        lessonMedia : lessonURL,
        mediaCaption: caption,
        lessonContent: lessonContent.value,
        mediaType: mediaType.value
      })
      .then(() => {
        console.log("success");
        alert("Lesson uploaded successfully");
        //window.location.href = 'books.html';
      })
      .catch((error) => {
        console.log(error);
        alert("Upload failed");
      });
    });
  }
  );
  }


