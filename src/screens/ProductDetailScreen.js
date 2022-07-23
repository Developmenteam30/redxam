import React, {useEffect, useRef, useState} from 'react';
import {Image, ImageBackground, SafeAreaView, Text, KeyboardAvoidingView, Platform, View, ScrollView, TouchableOpacity, Dimensions, FlatList} from 'react-native';
import { Card, AirbnbRating, Divider, Icon, Tab } from 'react-native-elements';
import styles from '../styles/SearchScreenStyle';
import { Images } from '../utils/Images';
import { colors } from '../utils/Variables';
import Carousel from 'react-native-snap-carousel';
import { Pagination } from 'react-native-snap-carousel';
import api from '../utils/Api';
import { connect } from "react-redux";
import { ActivityIndicator } from 'react-native';
const {width, height} = Dimensions.get('window');
const ProductDetailScreen = (props) => {
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;
    var _carousel = useRef(null);
  const [index, setIndex] = React.useState(0);
  const [count, setcount] = React.useState(0);
  const [products, setproducts] = useState(null);
  const [selected, setselected] = useState(null);
  const apicall = async (id) => {
    var cate = await api.getapi("productshow?q="+id);
    if (cate) {
      if (cate.product) {
        setproducts(cate.product);
        if (cate.product.media && cate.product.media.length > 0) {
          setselected(cate.product.media[0]);
        } else {
          setselected({original_url: "https://web.techinfomatic.com/assets/no-image.png"})
        }
      }
    }
  };
  addtowishlist = () => {
        var order = {
            'product_id': products.id,
        };
        var cate = await api.postapi(order,"addwish");
        if (cate) {
            Alert.alert(cate.message);
        } else if (cate && cate.message) {
            Alert.alert(cate.message);
        }
  }

  useEffect(() => {
    if (props.route.params.product) {
      apicall(props.route.params.product.id);
    }
    return () => { }
  }, [])
  const _renderItem = ({ item, index }) => {
        return (
          <Card style={styles.slide}>
            <Image source={{ uri: item.image }} style={styles.banner}/>
          </Card>
        );
  }
  const getselectedqty = (id) => {
    var i = 1;
    props.cart.forEach((c) => {
      if (c.id == id) {
        i = c.selectedQty;
      }
    });
    return i;
  }
  const checkincart = (id) => {
    var i = 0;
    props.cart.forEach((c) => {
      if (c.id == id) {
        i = 1;
      }
    });
    return i == 0 ? false : true;
  };

  const renderItem = ({ item, index }) => {
      return (
          <Card style={styles.catwidth}>
              <Image source={{ uri: item.image }} style={styles.imageb} />
              <TouchableOpacity onPress={()=>props.navigation.navigate('ProductDetailScreen')}>
                  <Text style={{ width: '100%', lineHeight: 24, textAlign: 'left', color: colors.dark }}>{item.name}</Text>
                  <AirbnbRating isDisabled={true} defaultRating={item.review} reviews={[]}
                      size={15}
                      selectedColor={colors.dark}
                      reviewSize={0}
                      starContainerStyle={{ padding: 0, margin: 0 }}
                      showRating={false}
                  />
                  <Text style={{ width: '100%', lineHeight: 24, textAlign: 'left', color: colors.dark, fontWeight: '600', fontSize: 14 }}>{item.discounted_price}</Text>
              </TouchableOpacity>
          </Card>
      );
  }

  return (
    <SafeAreaView style={[styles.mainContainer, { marginTop: 0 }]}>
      {products ?
        <ScrollView style={{ flex: 1, minHeight: 150, padding: 15, width: Dimensions.get('screen').width, backgroundColor: colors.light }}>
          {selected && selected.original_url ? (
            <Image source={{ uri: selected.original_url }} style={{ width: '100%', height: 190, resizeMode: 'contain' }} ></Image>
          ) : null}
          
        <View style={{ flexDirection: 'row' }}>
            {products.media && selected && products.media.map((data, index) => {
              return (
                <TouchableOpacity style={{ width: '23%', margin: '1%', height: 70 }} onPress={() => {
                  setselected(data);
                }}>
                  <Image source={{ uri: data.original_url }} style={{ width: '100%', borderWidth: selected.original_url == data.original_url ? 1 : 0, borderColor: colors.primary, margin: '1%', height: 70, resizeMode: 'contain' }} ></Image>
                </TouchableOpacity>
            )})}
        </View>
        <Text style={[styles.header, { width: '100%' }]}>{products.name}</Text>
        <View style={{ width: 130 }}>
            <AirbnbRating isDisabled={true} defaultRating={products.review} reviews={[]}
                size={20}
                reviewSize={0}
                selectedColor={colors.warning}
                starContainerStyle={{ padding: 0, margin: 0 }}
                showRating={false}
            />
        </View>
        <Text style={{color: 'white'}}>{count}</Text>  
        <Text style={{ width: '100%', lineHeight: 34, textAlign: 'left', color: colors.dark, fontWeight: '600', fontSize: 16 }}>AED {products.discounted_price}</Text>
        <Text style={{ width: '100%', textAlign: 'left', color: '#7E7E7E', fontWeight: '400', fontSize: 12 }}>{products.description}</Text>
        <Divider width={0.5} color={colors.primary} />  
        <View style={{ flexDirection: 'row', paddingVertical: 10 }}>
            {checkincart(products.id) ? (
              <View style={{ flexDirection: 'row', width: "50%" }}>
                <TouchableOpacity style={styles.navbutton} onPress={() => {
                  var cart = props.cart;
                  var i;
                  cart.forEach((c, ind) => {
                    if (c.id == products.id) {
                      i = ind;
                    }
                  });
                  if (cart[i].selectedQty && cart[i].selectedQty > 1) {
                    cart[i].selectedQty--;
                    products.selectedQty = cart[i].selectedQty;
                  } else {
                    cart.splice(i, 1);
                    products.selectedQty = null;
                  }
                  props.updateCart(cart);
                  setcount(count + 1);
                }}><Text style={styles.darkcolor}>-</Text></TouchableOpacity>
                <TouchableOpacity style={styles.navbutton}><Text style={styles.darkcolor}>{getselectedqty(products.id)}</Text></TouchableOpacity>
                <TouchableOpacity style={styles.navbutton} onPress={() => {
                  var cart = props.cart;
                  cart.forEach((c, ind) => {
                    if (c.id == products.id && products.quantity_in_stock > cart[ind].selectedQty) {
                      cart[ind].selectedQty++;
                      products.selectedQty = cart[ind].selectedQty;
                      setproducts(products);
                    }
                  });
                  props.updateCart(cart);
                  setcount(count + 1);
                }}><Text style={styles.darkcolor}>+</Text></TouchableOpacity>
              </View>
            ) : products.quantity_in_stock > 0 ? (
              <TouchableOpacity style={[styles.buttonfull, { marginVertical: 0, padding: 8, width: '50%', marginLeft: 10 }]} onPress={() => {
                var car = props.cart;
                products.selectedQty = 1;
                setproducts(products);
                car.push(products);
                props.updateCart(car);
                setcount(count + 1);
              }}>
                <Text style={[styles.buttontext, { fontSize: 12 }]}>ADD TO CART</Text>
              </TouchableOpacity>
            ) : ( 
              <Text style={{width: "50%", color: colors.warning, paddingHorizontal: 10, paddingVertical: 10}}>Out of stock</Text>
            )}
            <TouchableOpacity onPress={()=>{addtowishlist()}} style={{ width: '50%', alignItems: "flex-end", flexDirection: 'row', justifyContent: 'center' }}>
              <Icon type="feather" name={"heart"} size={30} color={colors.dark} />
              <Text style={[styles.buttontext, {fontSize: 12, color: colors.dark, textAlign: 'center', paddingVertical: 10}]}> ADD TO WISHLIST</Text>
            </TouchableOpacity>
        </View>
        <Divider width={0.5} color={colors.primary} />  
        <Tab
            value={index}
            onChange={(e) => setIndex(e)}
            indicatorStyle={{
                backgroundColor: 'black',
                height: 3,
            }}
            variant="primary"
        >
          <Tab.Item
              title="Details"
              titleStyle={{ fontSize: 12, color: colors.dark }}
              containerStyle={{backgroundColor: colors.light,borderBottomWidth: 0.5, borderBottomColor: colors.dark}}
          />
          <Tab.Item
              title="REVIEWS"
              titleStyle={{ fontSize: 12, color: colors.dark }}
              containerStyle={{backgroundColor: colors.light, borderBottomWidth: 0.5, borderBottomColor: colors.dark}}
          />
        </Tab>
        {index == 0 ?
          <View>
            <Text style={{ width: '100%', lineHeight: 34, textAlign: 'left', color: colors.dark, fontWeight: '500', fontSize: 12 }}>Part No.: {products.sku}</Text>
            <Text style={{ width: '100%', lineHeight: 34, textAlign: 'left', color: colors.dark, fontWeight: '500', fontSize: 12 }}>CATEGORY: {products.brand.name}</Text>
            <Text style={{ width: '100%', lineHeight: 34, textAlign: 'left', color: colors.dark, fontWeight: '500', fontSize: 12 }}>UOM: {props.jsondata && props.jsondata['uom'] ? props.jsondata['uom'][products.color] : products.color}</Text>
          </View>
          : 
          products.reviews && products.reviews.map((data, index) => {
            return (
              <View style={{paddingHorizontal : 10, borderBottomWidth: 0.6, marginTop: 10, borderBottomColor: colors.gray}}>
                <View style={{ width: 130 }}>
                    <AirbnbRating isDisabled={true} defaultRating={data.rating} reviews={[]}
                        size={20}
                        reviewSize={0}
                        selectedColor={colors.warning}
                        starContainerStyle={{ padding: 0, margin: 0 }}
                        showRating={false}
                    />
                </View>
                <Text style={{ width: '100%', lineHeight: 34, textAlign: 'left', color: colors.dark, fontWeight: '500', fontSize: 12 }}>{data.message}</Text>
              </View>
            )
          })
        }

        {products && products.productsLike ?
          <View>
            <Text style={[styles.header, { width: '100%' }]}>Related Products</Text>
            <FlatList
              data={products.productsLike}
              horizontal={true}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              style={{width: Dimensions.get('screen').width}}
            />
          </View>
        : null}
        </ScrollView>
        : <ActivityIndicator size={"large"} color={colors.primary} />
      }
    </SafeAreaView>
  );
};
function mapStateToProps(state) {
  return {
    cart: state.cartReducer,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    updateCart: (cart) => dispatch({ type: "UPDATE_CART", cart: cart }),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductDetailScreen);
