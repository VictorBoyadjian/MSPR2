import React, { PropsWithChildren, useState } from 'react';
import { Alert, Modal, StyleSheet, Pressable, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

import Icon from '@/components/ui/Icon';

export function ModalButtonContainer({ buttonChild, modalChild }: PropsWithChildren<{ buttonChild: React.ReactNode; modalChild: React.ReactNode }>) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  return (
    <>
      <Pressable
        onPress={() => setModalVisible(true)}
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1,
        })}>
        {buttonChild}
      </Pressable>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(!modalVisible)}>
              <Icon name="close" size={20} color="#888" />
            </Pressable>
            {modalChild}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#888',
  },
});

export default ModalButtonContainer;