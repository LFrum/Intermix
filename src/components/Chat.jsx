import React, { Component } from 'react';
import Messages from "./Messages.jsx";
import Input from "./Input.jsx"
import './Chat.css'

/**
 * 
 */
class Chat extends Component {
    constructor(props){
        super(props);
        this.state = {
            messages: [],
            user: {
              username: this.props.input,
              color: this.randomColor(),
            }
        }
    }

    componentDidMount() {
      let requestBody = JSON.stringify({
        requests: [
          {
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'FACE_DETECTION', maxResults: 5 },
              { type: 'LOGO_DETECTION', maxResults: 5 },
              { type: 'TEXT_DETECTION', maxResults: 5 },
              { type: 'IMAGE_PROPERTIES', maxResults: 5 },
              { type: 'CROP_HINTS', maxResults: 5 },
              { type: 'WEB_DETECTION', maxResults: 5 }
            ],
            image: {
              source: {
                imageUri: "./test1.jpg"
              }
            }
          }
        ]
      });

      
      const userVid = document.getElementById('userVid');
      const canvas = document.getElementById('canvas');
      const context = canvas.getContext('2d');
      const constraints = {
        // this will allow to ask user for permission of video access
        video: true,
      };

      // setup width & height of canvas to 
      canvas.width = userVid.innerWidth;
      canvas.height = userVid.innerHeight;

      // TODO: implement taking snapshot for an interval amount of time, i.e. 5000ms
      setInterval(function(){ 
        // drawImage is a canvas' function that will draw the image from specified source
        // Draw the video frame to the canvas and sent to .png file
        
        context.drawImage(userVid, 0,0, canvas.width, canvas.height);
        var currentImage = canvas.toDataURL('image/png');
        currentImage = currentImage.replace(/^data:image\/(png|jpg);base64,/, "");
      }, 5000);

      // Attach the video stream to the video element and autoplay.
      navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
          userVid.srcObject = stream;
      });

      //SETUP SCALE DRONE CONNECTION
      this.drone = new window.Scaledrone("Jh23ZEsBY5q1UjuJ", {
          data: this.state.user
      });
  
      //Scale drone open event, creates the room
      this.drone.on('open', error => {
          if (error) {
          return console.error(error);
          }
          const user = {...this.state.user};
          user.id = this.drone.clientId;
          this.setState({user});
      });

      //Assign observable room, the observable prefix is required
      const room = this.drone.subscribe("observable-hack");
  
      //Suscribe to data event of room to know when messages arrive
      room.on('data', (data, user) => {
          const messages = this.state.messages;
          messages.push({user, text: data});
          this.setState({messages});
      });


/*
       // A user joined the room!
       room.on('member_join', user => {
          const messages = this.state.messages;
          const message = ("" + user.clientData.username + " has arrived~");
          user.id = "arrived";
          messages.push({user, text: message});
          this.drone.publish({
            room: "observable-hack",
            message
          });
      });
      */
      
    };
/*
    submitToGoogle = async () => {
      try {
        this.setState({ uploading: true });
        let response = await fetch(
          'https://vision.googleapis.com/v1/images:annotate?key=' +
            Environment['GOOGLE_CLOUD_VISION_API_KEY'],
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
            method: 'POST',
            body: body
          }
        );
        let responseJson = await response.json();
        console.log(responseJson);
        this.setState({
          googleResponse: responseJson,
          uploading: false
        });
      } catch (error) {
        console.log(error);
      }
    };
    }
*/

/**
 * Generates a random color as a placeholder for an avatar
 */
    randomColor(){
      return '#' + Math.floor(
        Math.random() * 0xFFFFFF
        ).toString(16);
    };
  
    //Publish a new message to scaledrone
    onSendMessage = (message) => {
      this.drone.publish({
        room: "observable-hack",
        message
      });
    }

    
    
  
    render() {
      
      return (
        <React.Fragment>
              <body>
                <div id ="chat">
                  <Messages
                      messages={this.state.messages}
                      currentUser={this.state.user}
                    />
                  <Input
                    onSendMessage={this.onSendMessage}
                  />

                  <div id ="picture">    
                     <video id="userVid" controls autoplay></video>
                       <canvas id = "canvas"></canvas>
                  </div>
                   <div id ="emotion"> </div>
                 </div>
              </body>
        </React.Fragment>
      );
    }
    
}
 
export default Chat;