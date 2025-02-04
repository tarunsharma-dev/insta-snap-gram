import { INewUser } from "@/types";
import { account, appWriteConfig, avatars, databases } from "./config";
import { ID, Query } from "appwrite";

export async function createUserAccount(user: INewUser) {
  try {
    // create a new account
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(user.name);

    // save user to db
    const newUser = await saveUserToDb({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: new URL(avatarUrl),
    });

    // return the new user
    return newUser;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function saveUserToDb(user: {
  accountId: string;
  email: string;
  name: string;
  username: string;
  imageUrl: URL;
}) {
  try {
    const newUser = await databases.createDocument(
      appWriteConfig.databaseId,
      appWriteConfig.userCollectionId,
      ID.unique(),
      user
    );
    return newUser;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function signInAccount(user: { email: string; password: string }) {
  try {
    // console.log(user);

    const session = await account.createEmailPasswordSession(
      user.email,
      user.password
    );
    // console.log(session);

    return session;
  } catch (error) {
    console.log(error);
  }
}
// ============================== GET ACCOUNT

export async function getAccount() {
  try {
    const currentAccount = await account.get();
    console.log(currentAccount);

    return currentAccount;
  } catch (error) {
    console.log(error);
  }
}

export async function getCurrentUser() {
  try {
    // console.log("yoyo");

    const currentAccount = await getAccount();
    // console.log(currentAccount);

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );
    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
}

export async function signOutAccount() {
  try {
    await account.deleteSession("current");
    return true;
  } catch (error) {
    console.log(error);
  }
}
