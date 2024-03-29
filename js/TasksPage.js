import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Image, 
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import TaskModal from './TaskModal';
import * as SecureStore from 'expo-secure-store';
import { AuthContext } from "./AuthContext";

let deviceHeight = Dimensions.get("window").height;
let deviceWidth = Dimensions.get("window").width;

const TasksPage = ({ route, navigation }) => {
  const { post } = route.params;
  const authContext = useContext(AuthContext);
  const userToken = authContext.userToken;
  const userId = userToken ? userToken.sub : null;

  const [tasks, setTasks] = useState([]); 

  useEffect(() => {
      if (post.TeamId) {
          SecureStore.getItemAsync('jwt').then(token => {
              fetch('https://goodchildappfunctions.azurewebsites.net/api/team_tasks/' + post.TeamId + '?code=XzIMNOOQTjrYWXU5Stf00E9jaqtIy5YVycqEVeTeQVshAzFu2OF7-w==', {
                  method: 'GET',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                  }
              })
              .then(response => response.json())
              .then(data => {
                setTasks(data);                  
              })
              .catch((error) => {
                  console.error('Fetch error:', error);
              });
          });
      } else {
        setTasks([]);
      }
  }, [post.TeamId]);
  const [taskCompletions, setTaskCompletions] = useState([]);  
  console.log('Task list', tasks);

  useEffect(() => {
      if (post.TeamId && userId) { 
          SecureStore.getItemAsync('jwt').then(token => {
              fetch('https://goodchildappfunctions.azurewebsites.net/api/getTaskCompletion/' + post.TeamId + '/' + userId + '?code=VF70ntc05Q0MGFB1fprVTYHz2DJE1VvBTx5_N4NrTjYMAzFu2vFlqw==', {
                  method: 'GET',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                  }
              })
              .then(response => response.json())
              .then(data => {
                setTaskCompletions(data);                  
              })
              .catch((error) => {
                  console.error('Fetch error:', error);
              });
          });
      } else {
        setTaskCompletions([]);
      }
  }, [post.TeamId, userId]); 
  console.log('Completions', taskCompletions);

    const [selectedTask, setSelectedTask] = useState(null);

    
    const [filter, setFilter] = useState('all');
    const [allTasksActive, setAllTasksActive] = useState(true);
    const [incompleteTasksActive, setIncompleteTasksActive] = useState(false);
    const highPriorityBackgroundColors = ["#EFE4DB", "#EADBEF", "#DBE5EF", "#EFEDDB", "#DBEFE7"];
    const icons = [
        "browsers",
        "book",
        "grid",
        "business",
        "map",
        "paper-plane",
        "clipboard",
      ];
      const highPriorityImages = [
        'https://storage.googleapis.com/berkshirehathawaytestbucket/graph5.png',
        'https://storage.googleapis.com/berkshirehathawaytestbucket/graph1.png',
        'https://storage.googleapis.com/berkshirehathawaytestbucket/graph2.png',
        'https://storage.googleapis.com/berkshirehathawaytestbucket/graph3.png',
        'https://storage.googleapis.com/berkshirehathawaytestbucket/graph4.png',
        
      ];
      useEffect(() => {
        highPriorityImages.forEach(image => {
          Image.prefetch(image).then(() => {
            console.log('Image prefetched successfully:', image);
          }).catch(error => {
            console.error('Failed to prefetch image:', image, error);
          });
        });
      }, []);
      
      
      const FloatingNavBar = ({ navigation }) => {
        return (
          <SafeAreaView style={styles.navBarContainer}>
            <TouchableOpacity
              style={styles.selectedNavBarButton}
              onPress={() => navigation.navigate("TasksPage", {post})}>
              <Icon name="calendar" size={deviceHeight / 38} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navBarButton}
              onPress={() => navigation.navigate("LeaderboardPage", {post})}>
              <Icon name="podium" size={deviceHeight / 38} color="#670038" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navBarButton}
              onPress={() => navigation.navigate("AnalyticsPage", {post})}>
              <Icon name="trending-up" size={deviceHeight / 38} color="#670038" />
            </TouchableOpacity>
          </SafeAreaView>
        );
      };
      
  
      const allTasks = tasks.map(task => {
        const taskCompletion = taskCompletions.find(tc => tc.TaskId === task.TaskId);
        const isCompleted = taskCompletion ? taskCompletion.CompletionStatus === true : false;
        return { ...task, isCompleted };

      });
      const incompleteTasksCount = allTasks.filter(task => !task.isCompleted).length;
      
      let filteredTasks = [];
      if (filter === 'all') {
        filteredTasks = [...allTasks];
      } else if (filter === 'incomplete') {
        filteredTasks = allTasks.filter(task => !task.isCompleted);
      }
      


      return (
        <View style={styles.container}>
          <ScrollView style={styles.todoContainer}>
            <View style={styles.topContainer}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Home")}>
                <Icon name="arrow-back" size={deviceHeight / 38} color="black" />
              </TouchableOpacity>
              <View style={styles.titleContainer}>
                <Text style={styles.titleText}>TASKS</Text>
                <Text style={styles.groupText}>{post.TeamName}</Text>
              </View>
            </View>
      
            <View style={styles.filters}>
              <TouchableOpacity 
                style={filter === 'all' ? styles.filterButtonActive : styles.filterButton} 
                onPress={() => setFilter('all')}
              >
                <Text style={filter === 'all' ? styles.filterTextActive : styles.filterText}>ALL</Text>
                <View style={filter === 'all' ? styles.filterNumberActive : styles.filterNumber}>
                  <Text style={filter === 'all' ? styles.filterNumberTextActive : styles.filterNumberText}>
                    {allTasks.length}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                style={filter === 'incomplete' ? styles.filterButtonActive : styles.filterButton} 
                onPress={() => setFilter('incomplete')}
              >
                <Text style={filter === 'incomplete' ? styles.filterTextActive : styles.filterText}>TO DO</Text>
                <View style={filter === 'incomplete' ? styles.filterNumberActive : styles.filterNumber}>
                  <Text style={filter === 'incomplete' ? styles.filterNumberTextActive : styles.filterNumberText}>
                    {incompleteTasksCount}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <Text style = {styles.highPriorityTitleText}>High Priority</Text>
            <View style={styles.highPriorityTasksContainer}>
                <ScrollView horizontal = {true} showsHorizontalScrollIndicator = {false}>
                    {filteredTasks.map((task, index) => {
                        if (task.TaskId < 6) {
                            return (
                                <View key = {index} style={[styles.highPriorityTask, {backgroundColor: highPriorityBackgroundColors[task.TaskId % 5]}]}>
                                    <Image source = {{uri: (highPriorityImages[task.TaskId % 5])}} style = {styles.image}/>
                                    <View style= {styles.textContainer}>
                                        <Text style ={styles.highPriorityText}>{task.TaskName}</Text>
                                    </View> 
                                    <TouchableOpacity style = {styles.highPriorityButton} onPress={() => setSelectedTask(task)}>
                                        <Text style ={styles.highPriorityButtonText}>Edit task</Text>
                                        <Icon name="create" size={deviceHeight / 40} color='#670038' />
                                    </TouchableOpacity>                               
                                </View>
                            );
                        }
                    })}
                </ScrollView>
            </View>

            <Text style = {styles.normalPriorityTitleText}>Tasks</Text>
            <View style={styles.normalTasksContainer}>
            {filteredTasks.map((task, index) => {
                if (task.TaskId >= 6) {

                    return (
                        <View key = {index} style={styles.normalTask}>
                            <View style={styles.taskLeftContainer}>
                                <Text style ={styles.normalText}>{task.TaskName}</Text>
                                <TouchableOpacity style = {styles.normalButton} onPress={() => setSelectedTask(task)}>
                                    <Text style ={styles.normalButtonText}>Edit task</Text>
                                    <Icon name="create" size={deviceHeight / 40} color='white' />
                                </TouchableOpacity>
                            </View>
        
                            <View style={styles.taskRightContainer}>
                                <Icon name={icons[task.TaskId % icons.length]} size={deviceHeight / 15} color='#670038' />
                            </View>
        
                        </View>
                    );
                }
            })}
            </View>
        </ScrollView>
        <FloatingNavBar navigation={navigation} />
        {selectedTask && 
          <TaskModal 
            isVisible={!!selectedTask} 
            task={selectedTask ? tasks.find(task => task.TaskId === selectedTask.TaskId) : null} 
            onClose={() => setSelectedTask(null)}
            post ={post}
          />
        }


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    alignItems: "center",
  },
  topContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: deviceWidth,
    height: deviceHeight * 0.14,
    padding: deviceWidth * 0.05,
  },
  backButton: {
    position: 'absolute',
    left: '8%',
    bottom: '20%',
  },
  titleContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: 'absolute',
    bottom: '0%',
  },
  titleText: {
    fontSize: deviceHeight / 30,
    fontFamily: "manrope-semi-bold",
    color: "black",
  },
  groupText: {
    fontSize: deviceHeight / 45,
    fontFamily: "manrope-light",
    fontWeight: "light",
    color: "black",
  },
  todoContainer: {
    flex: 1,
    width: deviceWidth,
  },
  taskContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#ddd",
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: deviceWidth,
    padding: 10,
    marginBottom: deviceHeight/ 45,
  },
  filterButtonActive: {
    borderColor:'#670038',
    borderWidth: deviceWidth / 300,
    borderRadius: deviceWidth / 20,
    marginTop: deviceHeight * 0.01,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: deviceWidth * 0.03,
    width: '38%',
    height: deviceHeight * .048,
    backgroundColor: '#670038',
  },
  filterButton: {
    //padding: 10,
    borderColor: '#670038',
    borderWidth: deviceWidth / 240,
    borderRadius: deviceWidth / 20,
    marginTop: deviceHeight * 0.01,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: deviceWidth * 0.03,
    width: '38%',
    height: deviceHeight * .048,
  },
  filterText: {
    fontSize: deviceHeight / 70,
    fontFamily: "manrope-regular",
    color: "#670038",
  },
  filterTextActive: {
    fontSize: deviceHeight / 70,
    fontFamily: "manrope-regular",
    color: "white",
  },
  filterNumber:{
    //borderWidth: deviceWidth / 300,
    borderRadius: deviceWidth / 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '28%',
    height: deviceHeight * .022,
    backgroundColor: "#670038",
  },
  filterNumberActive:{
    //borderWidth: deviceWidth / 300,
    borderRadius: deviceWidth / 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '28%',
    height: deviceHeight * .022,
    backgroundColor: 'white',
  },
  filterNumberText: {
    fontSize: deviceHeight / 70,
    fontFamily: "manrope-regular",
    color: "white",
  },
  filterNumberTextActive: {
    fontSize: deviceHeight / 70,
    fontFamily: "manrope-regular",
    color: "#670038",
  },
  highPriorityTitleText: {
    fontSize: deviceHeight / 48,
    fontFamily: "manrope-medium",
    color: "black",
    marginLeft: '6%',
  },
  normalPriorityTitleText: {
    fontSize: deviceHeight / 48,
    fontFamily: "manrope-medium",
    fontWeight: "light",
    color: "black",
    marginLeft: '6%',
    marginTop: '5%',
    marginBottom: '3%',
  },
  highPriorityTasksContainer: {
    flexDirection: 'row',
    height: deviceHeight/3.35,
    justifyContent: 'space-around',
    marginLeft: '1.5%',
  },
  normalTasksContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    marginBottom: deviceHeight/6,
    alignItems: 'center',
  },
  highPriorityTask: {
    margin: 10,
    padding: 10,
    marginLeft: deviceWidth/30,
    borderRadius: deviceWidth/20,
    height: deviceHeight/3.6,    
    width: deviceWidth/2.1,
    overflow: 'hidden',
  },
  image: {
    borderRadius: deviceWidth/40,
    resizeMode: 'repeat',
    height: deviceHeight/.8,
    width: deviceWidth/1.2,
    overflow: 'hidden',
    position: 'absolute',
    top: '0%',
    right: '-200%',
    transform: [{ rotate: '-23deg' }],
    shadowColor: "#000",
    shadowOffset: {
        width: -10,
        height: 0,
      },
      shadowOpacity: 0.58,
      shadowRadius: 16.00,
  },
  textContainer: {
    width: "70%",
    numberOfLines: 2,
    ellipsizeMode: "tail",
    marginTop: '10%',
    marginLeft: '5%'
  },
  highPriorityText: {
    fontSize: deviceHeight / 52.5,
    fontFamily: "manrope-bold",
    color: "#670038",
  },
  highPriorityButton: {
    borderRadius: deviceWidth / 35,
    marginTop: deviceHeight * 0.01,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: deviceWidth * 0.04,
    width: deviceWidth/2.5,
    height: deviceHeight * .055,
    backgroundColor: 'white',
    position: 'absolute',
    bottom: '7%',
    left: '9%',
    shadowOffset: {
        width: 0,
        height: 2,
      },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  highPriorityButtonText: {
    fontSize: deviceHeight / 59,
    fontFamily: "manrope-bold",
    color: "#670038",
  },
  normalTask: {
    backgroundColor: "white",
    height: deviceHeight/6.5,    
    width: deviceWidth/1.17,
    flexDirection: "row",
    //justifyContent: "space-between",
    margin: 10,
    padding: 10,
    borderRadius: deviceWidth/40,
  },  
  taskLeftContainer: {
    width: '75%',
    height: '100%',
    flexDirection: "column",
    justifyContent: "center",
  },
  taskRightContainer: {
    width: '25%',
    height: '100%',
    alignItems: "center",
    justifyContent: "center",
  },
  normalText: {
    fontSize: deviceHeight / 52.5,
    fontFamily: "manrope-bold",
    color: "black",
    position: 'absolute',
    top: '12%',
    left: '5%',
  },
  normalButton: {
    borderRadius: deviceWidth / 35,
    marginTop: deviceHeight * 0.01,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: deviceWidth * 0.04,
    width: deviceWidth/2.2,
    height: deviceHeight * .055,
    backgroundColor: '#670038',
    position: 'absolute',
    bottom: '13%',
    left: '5%',
    shadowOffset: {
        width: 0,
        height: 2,
      },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  normalButtonText: {
    fontSize: deviceHeight / 59,
    fontFamily: "manrope-bold",
    color: "white",
  },
  navBarContainer: {
    flexDirection: "row",
    borderRadius: deviceHeight/40,
    justifyContent: "space-around",
    alignItems: "center",
    position: "absolute",
    bottom: '5%',
    left: '7%',
    right: '7%',
    height: deviceHeight/10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e8e8e8",
    paddingHorizontal: 15,
    //zIndex: 100,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowRadius: 3.62,
    elevation: 4,
  },
  navBarButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: deviceHeight/54,
    width: deviceWidth/5,
  },
  selectedNavBarButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor:'#670038',
    borderRadius: deviceHeight/54,
    width: deviceWidth/5,
  },

});

export default TasksPage;
/* could be useful later
let taskStatus;
if(task.isCompleted) {
    taskStatus = 'Completed';
} else {
    taskStatus = 'Incomplete';
}

<Text>{taskStatus}</Text>
*/