import * as firebase from "firebase/app";
import "firebase/firestore";

export default class Database {
  static addNewUser(userId, userData) {
    // TODO: update rules on firebase db console
    firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .set(userData)
      .catch(error => console.error("Error adding user to DB: ", error));
  }

  static addResearchData(researcherUserId, researcherData) {
    return firebase
      .firestore()
      .collection("users")
      .doc(researcherUserId)
      .update(researcherData);
  }

  static addVolunteerData(volunteerUserId, additionalData) {
    return firebase
      .firestore()
      .collection("users")
      .doc(volunteerUserId)
      .update(additionalData);
  }

  static async getUserData(userId) {
    const doc = await firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .get();

    return doc.data();
  }

  static addProgram(researcherUserId, programData, programTags) {
    const {
      title,
      date,
      venue,
      duration,
      compensation,
      type,
      number,
      description,
    } = programData;

    const data = {
      researcherUserId,
      title,
      description,
      type,
      number,
      applicantsId: 0,
      tags: programTags,
      details: {
        date,
        compensation,
        venue,
        duration,
      },
    };

    return firebase
      .firestore()
      .collection("programs")
      .add(data)
      .then(docRef => docRef.id)
      .then(programId => {
        firebase
          .firestore()
          .collection("users")
          .doc(researcherUserId)
          .update({
            programIds: firebase.firestore.FieldValue.arrayUnion(programId),
          });
      });
  }

  static async getAllPrograms() {
    const querySnapshot = await firebase
      .firestore()
      .collection("programs")
      .get();
    const programs = querySnapshot.docs.map(doc => {
      return { id: doc.id, ...doc.data() };
    });

    return programs;
  }

  static async getResearchersPrograms(researcherUserId) {
    if (researcherUserId == null) {
      return;
    }

    const querySnapshot = await firebase
      .firestore()
      .collection("programs")
      .where("researcherUserId", "==", researcherUserId)
      .get();
    const programs = querySnapshot.docs.map(doc => {
      return { id: doc.id, ...doc.data() };
    });

    return programs;
  }

  static async addApplicantIdToResearchProgram(volunteerUserId, programId) {
    if (volunteerUserId == null || programId == null) {
      return;
    }

    return firebase
      .firestore()
      .collection("programs")
      .doc(programId)
      .update({
        applicantsId: firebase.firestore.FieldValue.arrayUnion(volunteerUserId),
      });
  }

  static async getNumberofApplicants(programId) {
    if (programId == null) {
      return;
    }

    const querySnapshot = await firebase
      .firestore()
      .collection("programs")
      .doc(programId)
      .get();

    const numApplicants = querySnapshot.docs.length;
    return numApplicants;
  }
}
