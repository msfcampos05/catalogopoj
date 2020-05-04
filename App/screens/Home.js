import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Text,
  StatusBar,
  TextInput,
  Image,
  Dimensions,
  TouchableOpacity,
  Alert
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import addImage from '../../assets/plusCategory.png';
import * as firebase from 'firebase';
import Lottie from 'lottie-react-native';
import dataloading from '../Components/loaders/home-loading.json';
import deleteLoading from '../Components/loaders/check.json';
const { width, height } = Dimensions.get('window');

export default class Home extends Component {

  constructor(props) {
    super(props);

    this.state = {
      query: null,
      dataSource: [],
      dataBackup: [],
      loading: false,
      dataPd: [],
      whatoading: 1
    };
  }

  //Alert to confirm add item to wallet
  AlertBuilding() {
    Alert.alert(
      'Página em construção',
      'Página de detalhes do produto em construção!',
      [
        { text: 'Fechar', style: 'cancel' },
      ],
      { cancelable: false }
    )

  }
  //add item to wallet 
  handledeleteItembyId = async (id) =>{

    this.setState({whatoading: 'delete' });
    this.setState({loading: true });

    await firebase.firestore()
      .collection("products")
      .doc(id)
      .delete().then( ()=> {
      setTimeout(() => {
        this.setState({loading: false });
      },
        1000);
        console.log("Document successfully deleted!");
      }).catch(function (error) {
        console.error("Error removing document: ", error);
      });
  }

  //Alert to confirm add item to wallet
  addItemWalletById(id) {
    Alert.alert(
      'Deseja excuir o cupom?',
      'Esta ação não pode ser desfeita!',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => this.handledeleteItembyId(id) },
      ],
      { cancelable: false }
    )

  }
  getFirebaseData = async () => {

    await firebase.firestore()
      .collection('products')
      .onSnapshot(querySnapshot => {
        const list = [];
        querySnapshot.forEach(doc => {
          const { descricao, img, produto, valor } = doc.data();
          list.push({
            id: doc.id,
            descricao,
            img,
            produto,
            valor
          });

        });

        this.setState({
          dataPd: list,
        })

        if (this.loading) {
          this.setState({
            loading: false
          })
        }
      });
  }


  componentDidMount() {
    console.log(firebase.auth().currentUser.photoURL)
    var Unmount;

    Unmount = this.getFirebaseData().then(() => {
      this.setState({whatoading: 1 });
      this.setState({loading: true });
      setTimeout(() => {
        this.setState({loading: false });
      },
        2000);
    }
    );

    this.componentWillUnmount(Unmount)
  }


  componentWillUnmount(Unmount) {
    Unmount;
  }


  filterItem = event => {

    var query = event.nativeEvent.text;
    this.setState({
      query: query,
    });

    if (query == '') {
      this.setState({
        dataSource: this.state.dataBackup,
      });
      console.log(dataSource);
    } else {
      var data = this.state.dataBackup;
      query = query.toLowerCase();
      data = data.filter(l => l.produto.toLowerCase().match(query));

      this.setState({
        dataSource: data,
      });
    }
  };

  separator = () => {
    return (
      <View style={{ height: 5, width: '100%', backgroundColor: '#e5e5e5' }} />
    );
  };

  render() {

    if (this.state.loading == true && this.state.whatoading == 1) {
      return (
        <View style={{ flex: 1,justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#9b58b6' }}>
          <Lottie source={dataloading} style={{ width: 350, height: 350 }} autoPlay loop />
          <Text style={{ textAlign: 'center', color: '#ffff', fontSize: 12 }}>Aguarde...</Text>
        </View>
      )
    }else if (this.state.loading == true && this.state.whatoading == 'delete') {
      return (
          <View style={{ flex: 1, justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#ffff' }}>
              <Lottie source={deleteLoading} style={{ width: 350, height: 350 }} autoPlay loop />
          </View>
      )
  }
    const { navigation } = this.props;
    console.disableYellowBox = true;
    return (
      <View style={styles.container}>

        <StatusBar barStyle="light-content" backgroundColor="#ff5b77" />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Desconto Fácil App</Text>
        </View>

        <View style={styles.header}>
          <View style={styles.SectionStyle}>
            <Image
              //We are showing the Image from online
              source={{ uri: 'https://img.icons8.com/ios/100/000000/search--v1.png', }}
              //Image Style
              style={styles.ImageStyle}
            />
            <TextInput
              underlineColorAndroid="transparent"
              placeholder="O que procura..."
              placeholderTextColor="gray"
              value={this.state.query}
              onChange={this.filterItem.bind(this)}
              style={styles.input}
            />
          </View>
        </View>

        <FlatList
          data={this.state.dataPd}
          ItemSeparatorComponent={() => this.separator()}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                onLongPress={() => this.addItemWalletById(item.id)}
                onPress={() => {
                  navigation.push('ProductDetails', {
                    itemId: item.id,
                    itemName: item.produto,
                    itemPrice: item.valor,
                    itemImg: item.img,
                    itemDescription: item.descricao,
                  })
                }}>
                <View style={styles.productContainer}>
                  <Image
                    resizeMode="contain"
                    style={styles.image}
                    source={{ uri: item.img }}
                  />
                  <View style={styles.dataContainer}>
                    <Text numberOfLines={1} style={styles.title}>
                      {item.produto}
                    </Text>
                    <Text numberOfLines={8} style={styles.description}>
                      {item.descricao}
                    </Text>
                    <Text style={styles.price}>{item.valor}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
        <View>
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.push('addProducts')}>
            <View style={styles.ViewiButton}>
              <Image style={styles.Image} source={addImage} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}



