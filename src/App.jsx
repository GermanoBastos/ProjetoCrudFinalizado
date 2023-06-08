import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button, Table, Modal } from "react-bootstrap";

const App = () => {
  const [formData, setFormData] = useState({
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
    setUsers([...users, newUser]);
    setFormData({
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
    setShowModal(false);
  };

  const handleEditUser = () => {
    const updatedUsers = [...users];
    updatedUsers[editIndex] = { ...formData };
    setUsers(updatedUsers);
    setEditIndex(-1);
    setFormData({
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
    setShowModal(false);
  };

  const handleDeleteUser = (index) => {
    const updatedUsers = users.filter((_, i) => i !== index);
    setUsers(updatedUsers);
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
      const fetchCities = async () => {
        const response = await axios.get(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState.id}/municipios`
        );
        setCidades(response.data);
      };

      fetchCities();
    }

    setFormData({ ...formData, state: stateCode, city: "" });
  };

  return (
    <div className="container" style={{ marginTop: "20px" }}>
      <Button variant="primary" onClick={() => setShowModal(true)}>
        Novo Usuário
      </Button>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editIndex === -1 ? "Cadastro de Usuário" : "Editar Usuário"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Telefone</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>CEP</Form.Label>
              <div className="d-flex align-items-center">
                <Form.Control
                  type="text"
                  name="cep"
                  value={formData.cep}
                  onChange={handleInputChange}
                  required
                />
                <Button variant="primary" onClick={handleCepSearch}>
                  Buscar
                </Button>
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Endereço</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select
                name="state"
                value={formData.state}
                onChange={handleStateChange}
                required
              >
                <option value="">Selecione um estado</option>
                {estados.map((estado) => (
                  <option key={estado.id} value={estado.sigla}>
                    {estado.sigla} - {estado.nome}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Município</Form.Label>
              <Form.Select
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecione um município</option>
                {cidades.map((cidade) => (
                  <option key={cidade.id} value={cidade.nome}>
                    {cidade.nome}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Bairro</Form.Label>
              <Form.Control
                type="text"
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Data de Cadastro</Form.Label>
              <Form.Control
                type="date"
                name="registrationDate"
                value={formData.registrationDate}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              {editIndex === -1 ? "Cadastrar" : "Salvar"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      <h2>Usuários Cadastrados</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Endereço</th>
            <th>Estado</th>
            <th>Município</th>
            <th>Bairro</th>
            <th>Data de Cadastro</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.address}</td>
              <td>{user.state}</td>
              <td>{user.city}</td>
              <td>{user.neighborhood}</td>
              <td>{user.registrationDate}</td>
              <td>
                <Button
                  variant="info"
                  onClick={() => handleEditButtonClick(index)}
                >
                  Editar
                </Button>{" "}
                <Button
                  variant="danger"
                  onClick={() => handleDeleteUser(index)}
                >
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


