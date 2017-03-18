/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import EventSource from 'react-native-event-source';   //EventSource.js polyfill using XHR
global.EventSource = EventSource;

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Image,
  ListView,
  Alert,
} from 'react-native';

import { ServerEventsClient } from 'servicestack-client';
import { PostChatToChannel } from './dtos';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
const dsUsers = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

export default class App extends Component {
  constructor(props){
    super(props);
    this.state = { 
      baseUrl: "http://chat.servicestack.net", 
      channel: "home", 
      txtChat: "Hi from React Native!",
      status: "",
      sub: null,
      messages:[],
      users: [], 
      client:null,
      dataSource: ds.cloneWithRows([]),
      dataSourceUsers: dsUsers.cloneWithRows([]),
    };
    setTimeout(this.startListening, 1);
  }

  startListening = () => {
    if (this.client)
      this.client.stop();

    console.log(`Listening on ${this.state.baseUrl}...`)
    this.client = new ServerEventsClient(this.state.baseUrl, [this.state.channel], {
      handlers: {
        onConnect: (e) => {
          e.heartbeatIntervalMs = 30000;
          this.refresh(this.sub = e);
        },
        onJoin: this.refresh,
        onLeave: this.refresh,
        onUpdate: this.refresh,
        onMessage: this.addMessage
      }, 
      onException: e => {
        console.log('onException', e);
        this.addMessageJsx(<Text style={styles.error}>{e.message || e + ""}</Text>);
      }
    }).start()
  }

  refresh = (e) => {
    console.log(e.cmd);
    this.addMessage(e);
    this.refreshUsers();
  }

  addMessage = (e) => {
    this.addMessageJsx(<Text style={styles.message}>{e.selector} {e.json}</Text>);
  }

  addMessageJsx = (jsx) => {
      var messages = this.state.messages;
      (messages[this.state.channel] || (messages[this.state.channel] = [])).push(jsx);
      this.setState({ messages, dataSource: ds.cloneWithRows(messages[this.state.channel]) })
  }

  refreshUsers = async () =>  {
    var users = await this.client.getChannelSubscribers();
    users.sort((x,y) => y.userId.localeCompare(x.userId));
    this.setState({ 
      users,
      dataSourceUsers: dsUsers.cloneWithRows(users)
    });
  }

  sendChat = () => {
    if (!this.state.txtChat || !this.sub) 
      return;

    let request = new PostChatToChannel();
    request.from = this.sub.id;
    request.channel = this.state.channel;    
    request.selector = "cmd.chat";
    request.message = this.state.txtChat;
    this.client.serviceClient.post(request);
  }

  render() {
    var i = 0;
    return (
      <View style={{flex: 1, flexDirection: 'row'}}>
        <View style={{width: "35%", height: "100%", backgroundColor: '#f1f1f1', paddingTop: 0}}>
          <Text style={styles.h2}>channel</Text>
          <TextInput defaultValue={this.state.baseUrl} autoCapitalize="none" placeholder="{baseUrl}" 
                     style={styles.textInput} 
                     onChangeText={(baseUrl) => this.setState({ baseUrl })} />
          <TextInput defaultValue={this.state.channel} autoCapitalize="none" placeholder="{channel}" 
                     style={styles.textInput} 
                     onChangeText={(channel) => this.setState({ channel })} />
          <Button styles={styles.button} title="change" onPress={this.startListening} />
          <TextInput style={styles.textInput} defaultValue={this.state.txtChat} autoCapitalize="none"
                     onChangeText={txtChat => this.setState({ txtChat })} />
          <Button styles={styles.button} title="post chat" onPress={this.sendChat} />
          <Text style={styles.h2}>users</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap'  }}>
            {this.state.users.map(x => 
              (<Image key={x.userId} source={{ uri: x.profileUrl }} style={{ width: 50, height: 50, marginTop:4, marginLeft:4 }}>
                  <Text style={{color: (x.userId == (this.sub && this.sub.userId) ? '#000' : '#666'), 
                    backgroundColor:'rgba(0,0,0,0)', marginTop:38, fontSize:10, textAlign:'center'}}>
                    @{x.displayName}
                  </Text>
               </Image>)  
            )}
          </View>
        </View>
        <View style={{width: "65%", height: "100%", backgroundColor: "#fff", paddingTop: 0}}>
          <Text style={styles.h2}>messages</Text>
          {(this.state.messages[this.state.channel] || []).length > 0
            ? (<ListView dataSource={this.state.dataSource} style={{ height: 100 }}
                         renderRow={x => <View style={i++ % 2 == 0 ? styles.row : styles.altRow}>{x}</View>} />)
            : null}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  h2: {
    textAlign: "center", 
    backgroundColor: "#444", 
    color: "#fff",
  },
  button: {
    margin: 0,
    padding: 0,
  },
  textInput: {
    height: 24, 
    backgroundColor: "white",
    margin: 4,
    marginBottom: 0,
    paddingLeft: 4
  },
  row: {
    backgroundColor: "#fff",
  },
  altRow: {
    backgroundColor: "#f1f1f1",
  },
  message: {
    fontSize: 10,
  },
  error: {
    fontSize: 10,
    color: "#f00"
  }
});

const client = null;

const startListening = () => {
  if (client != null)
    client.stop();
}

AppRegistry.registerComponent('reactnative', () => App);
