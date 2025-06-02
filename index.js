const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const CLIENT_ID = 'SEU_CLIENT_ID';
const CLIENT_SECRET = 'SEU_CLIENT_SECRET';

const authUrl = 'https://api.bspay.com.br/auth/token';
const pixUrl = 'https://api.bspay.com.br/pix/charge';

async function getToken() {
  const { data } = await axios.post(authUrl, {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  });
  return data.access_token;
}

app.post('/criar-pix', async (req, res) => {
  try {
    const token = await getToken();
    const { valor, descricao } = req.body;

    const { data } = await axios.post(pixUrl, {
      calendario: { expiracao: 3600 },
      valor: { original: valor },
      chave: "SUA_CHAVE_PIX",
      solicitacaoPagador: descricao || "Pagamento BSPAY"
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    res.json({
      pix: data,
      qrCode: data.loc?.imagemQrcode
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ erro: 'Erro ao gerar Pix' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Servidor rodando na porta', PORT);
});