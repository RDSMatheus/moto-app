# Documentação do WebSocket Gateway (`EventsGateway`)

Este gateway gerencia as conexões em tempo real entre **Lojas** e **Motoboys**. A comunicação é baseada em eventos Socket.io.

## 📌 Autenticação

Todas as conexões WebSocket devem ser autenticadas. O token JWT deve ser enviado de uma das seguintes formas durante o `handshake` (conexão):

1.  **Autenticação Inline**:
    ```javascript
    {
      auth: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      }
    }
    ```
2.  **Header Authorization**:
    ```javascript
    headers: {
      authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
    }
    ```

Se a autenticação falhar, a conexão será desconectada imediatamente.

---

## 🔗 Rooms (Salas)

O gateway utiliza salas (rooms) para direcionar mensagens específicas:

| Room Name                  | Descrição               | Participantes              |
| :------------------------- | :---------------------- | :------------------------- |
| `store:{storeId}`          | Sala principal da loja  | Donos da Loja              |
| `store:{storeId}:couriers` | Sala de pedidos da loja | Motoboys vinculados à loja |

---

## 📥 Client → Server (Requisições)

O cliente pode enviar mensagens usando `socket.emit`. Abaixo estão os eventos suportados.

### 1. `order:accept`

Aceita um pedido disponível. **Exclusivo para Motoboys**.

- **Requisito**: O usuário conectado deve ter `role === 'courier'`.
- **Payload**: Um JSON stringificado contendo:
  ```json
  {
    "orderId": 123,
    "courierId": "uuid-do-motoboy",
    "storeId": "uuid-da-loja"
  }
  ```
- **Resposta Sucesso (`200`):**
  ```json
  {
    "event": "order:accept:success",
    "data": {/* Objeto Order completo atualizado */}
  }
  ```
- **Resposta Erro (`4xx`):**
  ```json
  {
    "event": "order:accept:error",
    "data": "Mensagem de erro (ex: 'Apenas motoboys...', 'Erro ao aceitar pedido')"
  }
  ```

### 2. `order:arrived`

Marca o pedido como "chegou na loja". **Exclusivo para Motoboys**.

- **Requisito**: O usuário conectado deve ter `role === 'courier'`.
- **Payload**: Um JSON stringificado contendo:
  ```json
  {
    "orderId": 123,
    "courierId": "uuid-do-motoboy",
    "storeId": "uuid-da-loja"
  }
  ```
- **Resposta Sucesso (`200`):**
  ```json
  {
    "event": "order:arrived:success",
    "data": {/* Objeto Order atualizado com status 'ARRIVED_AT_STORE' */}
  }
  ```
- **Resposta Erro (`4xx`):**
  ```json
  {
    "event": "order:arrived:error",
    "data": "Mensagem de erro"
  }
  ```

### 3. `order:in_route`

Marca o pedido como "em rota" (saiu da loja). **Exclusivo para Motoboys**.

- **Requisito**: O usuário conectado deve ter `role === 'courier'`.
- **Payload**: Um JSON stringificado contendo:
  ```json
  {
    "orderId": 123,
    "courierId": "uuid-do-motoboy",
    "storeId": "uuid-da-loja"
  }
  ```
- **Resposta Sucesso (`200`):**
  ```json
  {
    "event": "order:in_route:success",
    "data": {/* Objeto Order atualizado com status 'IN_ROUTE' */}
  }
  ```
- **Resposta Erro (`4xx`):**
  ```json
  {
    "event": "order:in_route:error",
    "data": "Mensagem de erro"
  }
  ```

### 4. `order:delivered`

Finaliza o pedido. **Exclusivo para Motoboys**.

- **Requisito**: O usuário conectado deve ter `role === 'courier'`.
- **Payload**: Um JSON stringificado contendo:
  ```json
  {
    "orderId": 123,
    "courierId": "uuid-do-motoboy",
    "storeId": "uuid-da-loja"
  }
  ```
- **Resposta Sucesso (`200`):**
  ```json
  {
    "event": "order:delivered:success",
    "data": {/* Objeto Order atualizado com status 'DELIVERED' */}
  }
  ```
- **Resposta Erro (`4xx`):**
  ```json
  {
    "event": "order:delivered:error",
    "data": "Mensagem de erro"
  }
  ```

### 5. `courier:location`

Atualiza a localização do motoboy. **Exclusivo para Motoboys**.

- **Requisito**: O usuário conectado deve ter `role === 'courier'`.
- **Payload**: Um JSON stringificado contendo:
  ```json
  {
    "courierId": "uuid-do-motoboy",
    "latitude": -20.3155,
    "longitude": -40.3121
  }
  ```
- **Resposta Sucesso (`200`):**
  ```json
  {
    "event": "courier:location:success",
    "data": {/* Objeto Courier com localização atualizada */}
  }
  ```
- **Resposta Erro (`4xx`):**
  ```json
  {
    "event": "courier:location:error",
    "data": "Mensagem de erro"
  }
  ```

### 6. `whoami`

Consulta o status atual da conexão.

- **Resposta:**
  ```json
  {
    "userId": "uuid-do-usuario",
    "role": "courier", // ou "store"
    "rooms": ["store:123:couriers"]
  }
  ```

---

## 📤 Server → Client (Eventos Emitidos)

O servidor emite eventos para notificar clientes sobre mudanças de estado.

### 1. `order:new`

Emitido quando um novo pedido é criado na loja.

- **Destinatários**: Todos os motoboys na sala `store:{storeId}:couriers`.
- **Payload**: Objeto `Order` completo.

### 2. `order:accepted`

Emitido quando um pedido é aceito (confirmação para a loja).

- **Destinatários**: Todos os donos da loja na sala `store:{storeId}`.
- **Payload**: Objeto `Order` completo.

### 3. `order:taken`

Emitido para informar que um pedido saiu da fila de disponibilidade.

- **Destinatários**: Todos os motoboys na sala `store:{storeId}:couriers`.
- **Payload**:
  ```json
  {
    "orderId": 123
  }
  ```

### 4. `order:arrived`

Emitido quando o motoboy marca que chegou na loja.

- **Destinatários**: Todos os donos da loja na sala `store:{storeId}`.
- **Payload**: Objeto `Order` completo.

### 5. `order:in_route`

Emitido quando o motoboy marca que saiu da loja para o cliente.

- **Destinatários**: Todos os donos da loja na sala `store:{storeId}`.
- **Payload**: Objeto `Order` completo.

### 6. `order:delivered`

Emitido quando o motoboy finaliza o pedido.

- **Destinatários**: Todos os donos da loja na sala `store:{storeId}`.
- **Payload**: Objeto `Order` completo.

---

## 🔄 Fluxo de Exemplo

1.  **Motoboy Conecta**:
    - Envia token.
    - Gateway verifica `role === 'courier'`.
    - Gateway consulta `storeCourier` ativo e entra nas salas `store:{id}:couriers`.

2.  **Nova Loja Cria Pedido via HTTP POST**:
    - Evento `order.created` disparado no sistema.
    - Gateway emite `order:new` para a sala `store:{id}:couriers`.
    - Motoboy recebe o pedido.

3.  **Motoboy Aceita Pedido**:
    - Motoboy envia `socket.emit('order:accept', payload)`.
    - Gateway valida permissão e executa `orderService.acceptOrder`.
    - Gateway emite `order:accepted` para a Loja (confirmado).
    - Gateway emite `order:taken` para outros Motoboys (pedido removido da fila).

4.  **Motoboy Chega na Loja**:
    - Motoboy envia `socket.emit('order:arrived', payload)`.
    - Gateway emite `order:arrived` para a Loja.

5.  **Motoboy Sai da Loja (Em Rota)**:
    - Motoboy envia `socket.emit('order:in_route', payload)`.
    - Gateway emite `order:in_route` para a Loja.

6.  **Motoboy Finaliza Pedido**:
    - Motoboy envia `socket.emit('order:delivered', payload)`.
    - Gateway emite `order:delivered` para a Loja.

7.  **Atualização de Localização**:
    - Motoboy envia `socket.emit('courier:location', payload)` periodicamente.
    - Gateway atualiza a localização no banco de dados.
