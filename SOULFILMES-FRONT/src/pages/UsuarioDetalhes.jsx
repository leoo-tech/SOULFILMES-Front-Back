import { useState, useEffect } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import { getUsuario, addFilmeAoUsuario, removeFilmeDoUsuario } from "../api/usuarios"; // Importe a função aqui
import { getFilmes, getFilmesDoUsuario } from "../api/filmes";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

function UsuarioDetalhes({ usuarioId, showModal, setShowModal, atualizarListaUsuarios, cleanSelectedUsuario }) {
  const [usuario, setUsuario] = useState(null);
  const [filmesUsuario, setFilmesUsuario] = useState([]);
  const [todosFilmes, setTodosFilmes] = useState([]);
  const [filmeSelecionado, setFilmeSelecionado] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Carrega detalhes do usuário
    getUsuario(usuarioId).then(setUsuario).catch(console.error);

    // Carrega filmes associados ao usuário
    getFilmesDoUsuario(usuarioId).then(setFilmesUsuario).catch(console.error);

    // Carrega todos os filmes disponíveis
    getFilmes().then(setTodosFilmes).catch(console.error);
  }, [usuarioId]);

  const handleAdicionarFilme = async () => {
    try {
      console.log("Tentando adicionar filme...");
      const response = await addFilmeAoUsuario(usuarioId, filmeSelecionado);
      console.log("Resposta:", response);

      if (response && response.success) {
        const filmeAdicionado = todosFilmes.find(filme => filme.id.toString() === filmeSelecionado);
        console.log("Filme adicionado:", filmeAdicionado);

        if (filmeAdicionado) {
          setFilmesUsuario(prev => [...prev, filmeAdicionado]);
          toast.success(response.data.message);
          atualizarListaUsuarios();
        } else {
          console.error("Filme não encontrado na lista de todos filmes.");
          toast.error("Filme não encontrado na lista.");
        }
      } else {
        throw new Error(response.message || "Erro desconhecido ao adicionar filme.");
      }
    } catch (error) {
      console.error("Erro ao associar filme ao usuário:", error);
      toast.error(`Erro ao adicionar filme: ${error.message || "Erro desconhecido."}`);
    } finally {
      setFilmeSelecionado(""); // Limpa a seleção do filme independentemente do resultado
      navigate("/usuarios");
    }
  };


  const handleRemoverFilme = async (filmeId) => {
    try {
      await removeFilmeDoUsuario(usuarioId, filmeId);
      setFilmesUsuario(prev => prev.filter(filme => filme.id !== filmeId));
      toast.success("Filme removido com sucesso.");
      console.log("Filme removido com sucesso.");
      navigate("/usuarios");
      // Opcional: Dar feedback
    } catch (error) {
      toast.error("Erro ao remover filme do usuário.");
      console.error("Erro ao remover filme do usuário:", error);
    }
  }

  return (
    <Modal show={showModal} onHide={() => {
      cleanSelectedUsuario();
      setShowModal(false);
    }}>
      <Modal.Header closeButton>
        <Modal.Title>Filmes do Usuário</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {filmesUsuario.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Gênero</th>
                <th>Ano</th>
              </tr>
            </thead>
            <tbody>
              {filmesUsuario.map(filme => (
                filme ? (
                  <tr key={filme.id}>
                    <td>{filme.titulo || 'Título não disponível'}</td>
                    <td>{filme.genero || 'Gênero não disponível'}</td>
                    <td>{filme.anoLancamento || 'Ano não disponível'}</td>
                    <td>
                      <Button
                        variant="danger"
                        onClick={() => handleRemoverFilme(filme.id)}
                      >
                        Remover
                      </Button>
                    </td>
                  </tr>
                ) : (
                  <tr key="undefined">
                    <td colSpan="3">Dados do filme não disponíveis</td>
                  </tr>
                )

              ))}
            </tbody>
          </Table>
        ) : (
          <p>Não há filmes associados a este usuário.</p>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Form.Select
          value={filmeSelecionado}
          onChange={(e) => setFilmeSelecionado(e.target.value)}
        >
          <option value="">Selecione um filme...</option>
          {todosFilmes.map(filme => (
            <option key={filme.id} value={filme.id}>
              {filme.titulo}
            </option>
          ))}
        </Form.Select>
        <Button
          variant="success"
          disabled={!filmeSelecionado}
          onClick={handleAdicionarFilme}
        >
          Adicionar Filme
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default UsuarioDetalhes;
