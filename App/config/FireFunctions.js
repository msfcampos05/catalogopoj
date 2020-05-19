
import * as firebase from 'firebase'
var moment = require('moment');

class FireFunctions {

    //Criar um novo usuário e atualizar os campos de profile
    addUser = async ({ username, email, phone_number, adress, password, localUri }) => {

        return new Promise((res, rej) => {

            this.auth
                .createUserWithEmailAndPassword(email, password)
                .then(() => {

                    //enviar foto para firebase e retorna url para remoteUri
                    const remoteUri = this.uploadUserPhotoAsync(localUri);

                    this.firestore
                        .collection('users') //Coleção raiz
                        .doc(this.uid) //Documento usuário único para cada usuário com seu uid
                        .collection('profile')
                        .doc('personal') // dentro do documento 'personal' adiciona os campos abaixo
                        .set({
                            name: username,
                            phone: phone_number,
                            adress: adress,
                        })
                        .then()
                        .catch(error => {
                            console.error(error);
                        });
                })
                .catch(error => {
                    if (error.code === 'auth/email-already-in-use') {
                        console.log('O email ja está sendo usado');
                    }

                    if (error.code === 'auth/invalid-email') {
                        console.log('Email invalido');
                    }

                    console.error(error);
                });

        });
    };

    //Faz o upload da imagem para o storage e retorna a função addUser uri da imagem.
    uploadUserPhotoAsync = async uri => {
        const path = `users/${this.uid}/${this.uid}.jpg`;

        return new Promise(async (res, rej) => {
            const response = await fetch(uri);
            const file = await response.blob();

            let upload = firebase
                .storage()
                .ref(path)
                .put(file);

            upload.on(
                "state_changed",
                snapshot => { },
                err => {
                    rej(err);
                },
                async () => {
                    const url = await upload.snapshot.ref.getDownloadURL();
                    res(url);
                }
            );
        });
    };

    //Adiciona um novo produto-cupon 
    addPost = async ({ text, price, description, localUri }) => {
        const remoteUri = await this.uploadPhotoAsync(localUri); //manda img para o firebase

        return new Promise((res, rej) => {
            this.firestore
                .collection("products")
                .add({
                    produto: text,
                    descricao: description,
                    valor: 'R$ ' + price,
                    img: remoteUri,
                })
                .then(ref => {
                    res(ref);
                })
                .catch(error => {
                    rej(error);
                });
        });
    };
    
    //Faz o upload da imagem para o storage e retorna a função addpost uri da imagem.
    uploadPhotoAsync = async uri => {
        const path = `products/${this.uid}/${Date.now()}.jpg`;

        return new Promise(async (res, rej) => {
            const response = await fetch(uri);
            const file = await response.blob();

            let upload = firebase
                .storage()
                .ref(path)
                .put(file);

            upload.on(
                "state_changed",
                snapshot => { },
                err => {
                    rej(err);
                },
                async () => {
                    const url = await upload.snapshot.ref.getDownloadURL();
                    res(url);
                }
            );
        });
    };

    get firestore() {
        return firebase.firestore();
    }
    get auth() {
        return firebase.auth();
    }

    get uid() {
        return (firebase.auth().currentUser || {}).uid;
    }

    get timestamp() {

        return dataId;
    }
}

FireFunctions.shared = new FireFunctions();
export default FireFunctions;