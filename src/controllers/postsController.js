import { getTodosPosts, criarPost, atualizarPost } from "../models/postsModel.js";
import fs from "fs";
import gerarDescricaoComGemini from "../services/geminiService.js";

export async function listarPosts(req, res) {
    //Chama a função para buscar os posts
    const posts = await getTodosPosts();
    //Envia uma resposta HTTP com status 200 (OK) e os posts no formato JSON
    res.status(200).json(posts);
}

export async function postarNovoPost(req, res) {
    // Extrai os dados do novo post enviados no corpo da requisição
    const novoPost = req.body;

    try {
        // Chama a função `criarPost` para inserir o novo post no banco de dados
        const postCriado = await criarPost(novoPost);

        // Retorna uma resposta HTTP 200 com o post criado como JSON
        res.status(200).json(postCriado);
    } catch (error) {
        // Caso ocorra algum erro, loga o erro no console e retorna uma resposta HTTP 500 com uma mensagem de erro genérica
        console.error(error.message);
        res.status(500).json({"erro":"Falha na requisição"});
    }
}

export async function uploadImagem(req, res) {
    // Cria um objeto com os dados do novo post, incluindo a imagem
    const novoPost = {
        descricao: "",
        imgUrl: req.file.originalname, // Salva o nome original do arquivo
        alt: ""
    };

    try {
        // Cria o post no banco de dados
        const postCriado = await criarPost(novoPost);

        // Constrói o novo caminho da imagem
        const imagemAtualizada = `uploads/${postCriado.insertedId}.png`;

        // Renomeia o arquivo para o novo caminho
        fs.renameSync(req.file.path, imagemAtualizada);

        // Retorna uma resposta HTTP 200 com o post criado
        res.status(200).json(postCriado);
    } catch (error) {
        // Caso ocorra algum erro, loga o erro no console e retorna uma resposta HTTP 500
        console.error(error.message);
        res.status(500).json({"erro":"Falha na requisição"});
    }
}

export async function atualizarNovoPost(req, res) {
    // Extrai os dados do novo post enviados no corpo da requisição
    const id = req.params.id;
    const urlImagem = `http://localhost:3000/${id}.png`    

    try {
        const imgBuffer = fs.readFileSync(`uploads/${id}.png`);
        const descricao = await gerarDescricaoComGemini(imgBuffer);
        
        const post = {
            imgUrl: urlImagem,
            descricao: descricao,
            alt: req.body.alt
        } 

        const postCriado = await atualizarPost(id, post);

        // Retorna uma resposta HTTP 200 com o post criado como JSON
        res.status(200).json(postCriado);
    } catch (error) {
        // Caso ocorra algum erro, loga o erro no console e retorna uma resposta HTTP 500 com uma mensagem de erro genérica
        console.error(error.message);
        res.status(500).json({"erro":"Falha na requisição"});
    }
}