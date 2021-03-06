import React, { Component} from "react";
import './App.css';
import Navigation from "./components/navigation/Navigation";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import Signin from "./components/SignIn/SignIn";
import Register from "./components/Register/Register";
import Particles from 'react-particles-js';

var particlesOption = {
  particles: {
    number:{
      value: 90,
      density: {
        enable: true,
        value_area: 800
      } 
    }
  }
}
 
const initialState = {
  
  input: '',
    imageUrl: '',
      boxes: [],
  route: 'signin',
    isSignedIn: false,
    user: {
     id: '',
     name: '',
     email: '',
     entries: 0,
     joined: new Date()
  }
}

class App extends Component {
  constructor(){
    super();
    this.state = initialState
  }
  

  calculateFaceLocation = (data)=>{
    // console.log(data.outputs[0].data.regions[0].region_info.bounding_box);
    return data.outputs[0].data.regions.map((face) => {
      const clarifaiFace = face.region_info.bounding_box;
      const image = document.getElementById("inputimage");
      const width = Number(image.width);
      const height = Number(image.height);
      return {
        leftCol: clarifaiFace.left_col * width,
        topRow: clarifaiFace.top_row * height,
        rightCol: width - clarifaiFace.right_col * width,
        bottomRow: height - clarifaiFace.bottom_row * height,
      };
    });
  }
   
  displayBox = (boxes) => {
    this.setState({ boxes});
  }
  onInputChange = (event)=>{
   this.setState({input: event.target.value});
  }

  onButtonSubmit = ()=>{
    this.setState({imageUrl: this.state.input});
    // console.log("click");
    fetch('https://mysterious-bastion-30381.herokuapp.com/imageurl', {
      method: 'post',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({
        input: this.state.input
      })
    })
      .then(response => response.json())
      .then(response => {
        if(response){
          fetch('https://mysterious-bastion-30381.herokuapp.com/image', {
            method: 'put',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count =>{
            this.setState(Object.assign(this.state.user, {entries: count}))
          })
        }
        this.displayBox(this.calculateFaceLocation(response))
      }
      )  
       .catch(err => console.log(err));
  }

  onRouteChange=(route)=>{
    if(route==='signout'){
      this.setState(initialState);
    } else if(route==='home'){
      this.setState({ isSignedIn:true });
    }
    this.setState({route:route});
  }

  loadUser = (data)=>{
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    })
  }
  
  render(){
    const { isSignedIn, imageUrl, route, boxes} = this.state; 
    return (
      <div className="App">
        <Particles className = 'particles'
          params={particlesOption}
         
        />
        <Navigation isSignedIn = {isSignedIn} onRouteChange = {this.onRouteChange}/>
        {
          route==='home'?
          
          <div>
        <Logo />
        <Rank name={this.state.user.name} entries={this.state.user.entries}/>
        <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit = {this.onButtonSubmit} />
        <FaceRecognition boxes = {boxes} imageUrl = {imageUrl}/>
        </div>
            : (route === 'signin')?
              <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            :
              <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />

          
        }
       

      </div>
    );
  }
}

export default App;
