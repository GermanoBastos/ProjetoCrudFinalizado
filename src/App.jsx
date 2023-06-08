import "firebase/firestore";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button, Table, Modal } from "react-bootstrap";

// Inicialize o Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDz3T-W25Ygmu2M7eBLmnndaqCNHC6uuqU",
  authDomain: "devops-eaf3d.firebaseapp.com",
  projectId: "devops-eaf3d",
  storageBucket: "devops-eaf3d.appspot.com",
  messagingSenderId: "949173003157",
  appId: "1:949173003157:web:8a01747c1bb5b7b120cc9c"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const App = () => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    cep: "",
    address: "",
    state: "",
    city: "",
    neighborhood: "",
    registrationDate: ""
  });

  const [users, setUsers] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [showModal, setShowModal] = useState(false);
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);

  useEffect(() => {
    const fetchEstados = async () => {
      const response = await axios.get("https://servicodados.ibge.gov.br/api/v1/localidades/estados");
      setEstados(response.data);
    };

    fetchEstados();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await db.collection("users").get();
      const fetchedUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(fetchedUsers);
    };

    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCepSearch = async () => {
    const response = await axios.get(`https://viacep.com.br/ws/${formData.cep}/json/`);
    const { data } = response;

    setFormData({
      ...formData,
      address: data.logradouro || "",
      state: data.uf || "",
      city: data.localidade || "",
      neighborhood: data.bairro || ""
    });
  };

  const handleAddUser = () => {
    const newUser = { ...formData };

    db.collection("users")
      .add(newUser)
      .then((docRef) => {
        setUsers([...users, { id: docRef.id, ...newUser }]);
        resetFormData();
        setShowModal(false);
      })
      .catch((error) => {
        console.error("Erro ao adicionar usuário:", error);
      });
  };

  const handleEditUser = () => {
    const updatedUser = { ...formData };

    db.collection("users")
      .doc(updatedUser.id)
      .set(updatedUser)
      .then(() => {
        const updatedUsers = users.map((user) => {
          if (user.id === updatedUser.id) {
            return updatedUser;
          }
          return user;
        });
        setUsers(updatedUsers);
        resetFormData();
        setEditIndex(-1);
        setShowModal(false);
      })
      .catch((error) => {
        console.error("Erro ao editar usuário:", error);
      });
  };

  const handleDeleteUser = (id) => {
    db.collection("users")
      .doc(id)
      .delete()
      .then(() => {
        const updatedUsers = users.filter((user) => user.id !== id);
        setUsers(updatedUsers);
      })
      .catch((error) => {
        console.error("Erro ao excluir usuário:", error);
      });
  };

  const handleEditButtonClick = (index) => {
    const userToEdit = users[index];
    setFormData(userToEdit);
    setEditIndex(index);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editIndex === -1) {
      handleAddUser();
    } else {
      handleEditUser();
    }
  };

  const handleStateChange = (e) => {
    const stateCode = e.target.value;
    const selectedState = estados.find((estado) => estado.sigla === stateCode);

    if (selectedState) {
      const fetchCidades = async () => {
        const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState.id}/municipios`);
        setCidades(response.data);
      };

      fetchCidades();
    } else {
      setCidades([]);
    }

    handleInputChange(e);
  };

  const resetFormData = () => {
    setFormData({
      id: "",
      name: "",
      email: "",
      phone: "",
      cep: "",
      address: "",
      state: "",
      city: "",
      neighborhood: "",
      registrationDate: ""
    });
  };

  return (
    <div className="container">
      <h1>Cadastro de Usuários</h1>
      <Button variant="primary" onClick={() => setShowModal(true)}>
        Novo Usuário
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editIndex === -1 ? "Novo Usuário" : "Editar Usuário"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="name">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="email">
              <Form.Label>E-mail</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="phone">
              <Form.Label>Telefone</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="cep">
              <Form.Label>CEP</Form.Label>
              <Form.Control
                type="text"
                name="cep"
                value={formData.cep}
                onChange={handleInputChange}
                onBlur={handleCepSearch}
                required
              />
            </Form.Group>
            <Form.Group controlId="address">
              <Form.Label>Endereço</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="state">
              <Form.Label>Estado</Form.Label>
              <Form.Control
                as="select"
                name="state"
                value={formData.state}
                onChange={handleStateChange}
                required
              >
                <option value="">Selecione o estado</option>
                {estados.map((estado) => (
                  <option key={estado.id} value={estado.sigla}>
                    {estado.sigla} - {estado.nome}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="city">
              <Form.Label>Cidade</Form.Label>
              <Form.Control
                as="select"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecione a cidade</option>
                {cidades.map((cidade) => (
                  <option key={cidade.id} value={cidade.nome}>
                    {cidade.nome}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="neighborhood">
              <Form.Label>Bairro</Form.Label>
              <Form.Control
                type="text"
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              {editIndex === -1 ? "Adicionar" : "Editar"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Telefone</th>
            <th>CEP</th>
            <th>Endereço</th>
            <th>Estado</th>
            <th>Cidade</th>
            <th>Bairro</th>
            <th>Data de Registro</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.cep}</td>
              <td>{user.address}</td>
              <td>{user.state}</td>
              <td>{user.city}</td>
              <td>{user.neighborhood}</td>
              <td>{user.registrationDate}</td>
              <td>
                <Button variant="primary" onClick={() => handleEditButtonClick(index)}>
                  Editar
                </Button>
                <Button variant="danger" onClick={() => handleDeleteUser(user.id)}>
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default App;
