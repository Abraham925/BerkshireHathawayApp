import React, { useState } from 'react';
import { useContext } from "react";
import { useEffect } from "react";
import * as SecureStore from 'expo-secure-store';
import { AuthContext } from "./AuthContext";

export const LeaderboardContext = React.createContext({
  leaderboardData: null,
  setLeaderboardData: () => {},
});

export const LeaderboardProvider = ({ children }) => {
    const [leaderboardData, setLeaderboardData] = useState(null);
    const [totalPoints, setTotalPoints] = useState(0);
    const [rank, setRank] = useState('Beginner');
    const authContext = useContext(AuthContext);
    const userToken = authContext.userToken;
    const userId = userToken ? userToken.sub : null;
    
    useEffect(() => {
      SecureStore.getItemAsync('jwt').then(token => {
        fetch('https://1c02-2600-1008-a111-a297-c1ef-aa97-3d94-7dd4.ngrok-free.app/leaderboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          }
        })
        .then(response => response.json())
        .then(data => {
          // Here, data is the array of leaderboard entries returned by the server
          // You can use the setLeaderboardData function to update your context
          setLeaderboardData(data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      });
    }, []);
  
    useEffect(() => {

      if (leaderboardData && userId) {
        // Filter the leaderboard data for entries with the same user ID
        const userEntries = leaderboardData.filter(entry => entry.RealtorId === userId);
        // Sum the points of the user's entries
        const points = userEntries.reduce((sum, entry) => sum + entry.Points, 0);
        setTotalPoints(points); 
  
        if (points <= 5000) {
          setRank("Beginner");
        } else if (points <= 15000) {
          setRank("Intermediate");
        } else {
          setRank("Expert");
        }
      }
    }, [leaderboardData]);

    const [groupRankings, setGroupRankings] = useState([]);

    useEffect(() => {
      if(!leaderboardData){
        return;
      }
    
      const teamUserPoints = {};
      
      leaderboardData.forEach(entry => {
        if (!teamUserPoints[entry.TeamId]) {
            teamUserPoints[entry.TeamId] = {};
        }
    
        if (teamUserPoints[entry.TeamId][entry.RealtorId]) {
            teamUserPoints[entry.TeamId][entry.RealtorId] += entry.Points;
        } else {
            teamUserPoints[entry.TeamId][entry.RealtorId] = entry.Points;
        }
      });
    
      const rankings = [];
    
      for (let TeamId in teamUserPoints) {
        const sortedUsers = Object.keys(teamUserPoints[TeamId]).sort((a, b) => teamUserPoints[TeamId][b] - teamUserPoints[TeamId][a]);
        sortedUsers.forEach((RealtorId, index) => {
            rankings.push({
              userId: RealtorId,
              rank: index + 1,  // ranks are 1-indexed
              points: teamUserPoints[TeamId][RealtorId],
              TeamId: TeamId
            });
        });
      }
    
      setGroupRankings(rankings);
    }, [leaderboardData]);
    
    
  
    return (
      <LeaderboardContext.Provider value={{ leaderboardData, setLeaderboardData, totalPoints, rank, groupRankings }}>
        {children}
      </LeaderboardContext.Provider>
    );
  };
  
