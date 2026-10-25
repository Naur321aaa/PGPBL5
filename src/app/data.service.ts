import { Injectable } from '@angular/core';
import { ref, push, update, onValue, remove, get } from 'firebase/database';
import { database } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  savePoint(point: {
    name: string,
    coordinates: string,
    description: string
  }) {
    const pointsRef = ref(database, 'points');
    return push(pointsRef, point);
  }

  getPoints() {
    const pointsRef = ref(database, 'points');
    return new Promise((resolve, reject) => {
      onValue(pointsRef, (snapshot) => {
        const data = snapshot.val();
        resolve(data);
      }, (error) => {
        reject(error);
      });
    });
  }

  getPoint(key: string) {
    const pointRef = ref(database, `points/${key}`);

    return new Promise((resolve, reject) => {
      get(pointRef).then((snapshot) => {
        const data = snapshot.val();
        resolve(data);
      }).catch((error) => {
        reject(error);
      });
    });
  }

    updatePoint(key: string, point: {
    name: string,
    coordinates: string
    description: string
  }) {
    const pointRef = ref(database, `points/${key}`);
    return update(pointRef, point);
  }

  deletePoint(key: string) {
    const pointRef = ref(database, `points/${key}`);
    return remove(pointRef);
  }

  // updatePoint(
  //   key: string,
  //   point: {
  //     name: string,
  //     coordinates: string,
  //     description: string
  //   }
  // ) {
  //   const pointRef = ref(database, `points/${key}`);
  //   return update(pointRef, point);
  // }

}
