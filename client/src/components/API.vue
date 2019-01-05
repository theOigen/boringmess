<template>
  <div class="container">
    <h1 align="center">BoringMessenger REST API (v2)</h1>
    <h2>Resources in this API:</h2>
    <p>
      <code>Users, Messages, Chats</code>
    </p>
    <h3>Users resource</h3>
    <hr>
    <h4>Allowed methods</h4>
    <ul>
      <li>GET (list of users)
        <ul>
          <li>
            URL:
            <code>/api/v2/users</code>
          </li>
          <li>URL params: none</li>
          <li>Queries:
            <ul>
              <li>Search=[string]: search throught list by string (in users case search by login)</li>
              <li>Page=[integer]: page number</li>
            </ul>
          </li>
          <li>Data params: none</li>
          <li>Success response:
            <ul>
              <li>Code: 200</li>Content: json paginated list
            </ul>
          </li>
          <li>Error response:
            <ul>
              <li>Code: 400 BAD REQUEST</li>Content:
              <code>{ error: "Bad Request" }</code>
            </ul>OR
            <ul>
              <li>Code: 401 UNAUTHORIZED</li>Content:
              <code>{ error: "Unauthorized" }</code>
            </ul>
          </li>
        </ul>
      </li>
      <li>GET (one user)
        <ul>
          <li>
            URL:
            <code>/api/v2/users/:id</code>
          </li>
          <li>URL params: required id=[string]</li>
          <li>Queries: none</li>
          <li>Data params: none</li>
          <li>Success response:
            <ul>
              <li>Code: 200</li>Content:
              user object in json format
            </ul>
          </li>
          <li>Error response:
            <ul>
              <li>Code: 400 BAD REQUEST</li>Content:
              <code>{ error: "Bad Request" }</code>
            </ul>OR
            <ul>
              <li>Code: 401 UNAUTHORIZED</li>Content:
              <code>{ error: "Unauthorized" }</code>
            </ul>OR
            <ul>
              <li>Code: 404 NOT FOUND</li>Content:
              <code>{ error: "Not Found" }</code>
            </ul>
          </li>
        </ul>
      </li>
      <li>PUT
        <ul>
          <li>
            URL:
            <code>/api/v2/users/:id</code>
          </li>
          <li>URL params: required id=[string]</li>
          <li>Queries: none</li>
          <li>Data params: login=[string], fullname=[string], bio=[string], optional image=[file]</li>
          <li>Success response:
            <ul>
              <li>Code: 200</li>Content: updated user object in json format
            </ul>
          </li>
          <li>Error response:
            <ul>
              <li>Code: 400 BAD REQUEST</li>Content:
              <code>{ error: "Bad Request" }</code>
            </ul>OR
            <ul>
              <li>Code: 401 UNAUTHORIZED</li>Content:
              <code>{ error: "Unauthorized" }</code>
            </ul>OR
            <ul>
              <li>Code: 404 NOT FOUND</li>Content:
              <code>{ error: "Not Found" }</code>
            </ul>OR
            <ul>
              <li>Code: 403 FORBIDDEN</li>Content:
              <code>{ error: "Forbidden" }</code>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
    <h3>Messages resource</h3>
    <hr>
    <h4>Allowed methods</h4>
    <ul>
      <li>GET (list of messages by current user)
        <ul>
          <li>
            URL:
            <code>/api/v2/messages</code>
          </li>
          <li>URL params: none</li>
          <li>Queries:
            <ul>
              <li>Search=[string]: search throught list by string (in messages case search by content)</li>
              <li>Page=[integer]: page number</li>
            </ul>
          </li>
          <li>Data params: none</li>
          <li>Success response:
            <ul>
              <li>Code: 200</li>Content: json paginated list
            </ul>
          </li>
          <li>Error response:
            <ul>
              <li>Code: 400 BAD REQUEST</li>Content:
              <code>{ error: "Bad Request" }</code>
            </ul>OR
            <ul>
              <li>Code: 401 UNAUTHORIZED</li>Content:
              <code>{ error: "Unauthorized" }</code>
            </ul>
          </li>
        </ul>
      </li>
      <li>GET (one message)
        <ul>
          <li>
            URL:
            <code>/api/v2/messages/:id</code>
          </li>
          <li>URL params: required id=[string]</li>
          <li>Queries: none</li>
          <li>Data params: none</li>
          <li>Success response:
            <ul>
              <li>Code: 200</li>Content:
              message object in json format
            </ul>
          </li>
          <li>Error response:
            <ul>
              <li>Code: 400 BAD REQUEST</li>Content:
              <code>{ error: "Bad Request" }</code>
            </ul>OR
            <ul>
              <li>Code: 401 UNAUTHORIZED</li>Content:
              <code>{ error: "Unauthorized" }</code>
            </ul>OR
            <ul>
              <li>Code: 404 NOT FOUND</li>Content:
              <code>{ error: "Not Found" }</code>
            </ul>
          </li>
        </ul>
      </li>
      <li>POST
        <ul>
          <li>
            URL:
            <code>/api/v2/messages</code>
          </li>
          <li>URL params: none</li>
          <li>Queries: none</li>
          <li>Data params: chat(chatID)=[string], content=[string] AND/OR file=[file]</li>
          <li>Success response:
            <ul>
              <li>Code: 201</li>Content:
              created message object
            </ul>
          </li>
          <li>Error response:
            <ul>
              <li>Code: 400 BAD REQUEST</li>Content:
              <code>{ error: "Bad Request" }</code>
            </ul>OR
            <ul>
              <li>Code: 401 UNAUTHORIZED</li>Content:
              <code>{ error: "Unauthorized" }</code>
            </ul>OR
            <ul>
              <li>Code: 403 FORBIDDEN</li>Content:
              <code>{ error: "Forbidden" }</code>
            </ul>
          </li>
        </ul>
      </li>
      <li>PUT
        <ul>
          <li>
            URL:
            <code>/api/v2/messages/:id</code>
          </li>
          <li>URL params: required id=[string]</li>
          <li>Queries: none</li>
          <li>Data params: content=[string]</li>
          <li>Success response:
            <ul>
              <li>Code: 200</li>Content:
              updated messages object
            </ul>
          </li>
          <li>Error response:
            <ul>
              <li>Code: 400 BAD REQUEST</li>Content:
              <code>{ error: "Bad Request" }</code>
            </ul>OR
            <ul>
              <li>Code: 401 UNAUTHORIZED</li>Content:
              <code>{ error: "Unauthorized" }</code>
            </ul>OR
            <ul>
              <li>Code: 404 NOT FOUND</li>Content:
              <code>{ error: "Not Found" }</code>
            </ul>OR
            <ul>
              <li>Code: 403 FORBIDDEN</li>Content:
              <code>{ error: "Forbidden" }</code>
            </ul>
          </li>
        </ul>
      </li>
      <li>DELETE
        <ul>
          <li>
            URL:
            <code>/api/v2/messages/:id</code>
          </li>
          <li>URL params: required id=[string]</li>
          <li>Queries: none</li>
          <li>Data params: none</li>
          <li>Success response:
            <ul>
              <li>Code: 200</li>Content: json format object with
              deleted message object and current chat last message object
            </ul>
          </li>
          <li>Error response:
            <ul>
              <li>Code: 400 BAD REQUEST</li>Content:
              <code>{ error: "Bad Request" }</code>
            </ul>OR
            <ul>
              <li>Code: 401 UNAUTHORIZED</li>Content:
              <code>{ error: "Unauthorized" }</code>
            </ul>OR
            <ul>
              <li>Code: 404 NOT FOUND</li>Content:
              <code>{ error: "Not Found" }</code>
            </ul>OR
            <ul>
              <li>Code: 403 FORBIDDEN</li>Content:
              <code>{ error: "Forbidden" }</code>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
    <h3>Chats resource</h3>
    <hr>
    <h4>Allowed methods</h4>
    <ul>
      <li>GET (list of chats of current user)
        <ul>
          <li>
            URL:
            <code>/api/v2/chats</code>
          </li>
          <li>URL params: none</li>
          <li>Queries:
            <ul>
              <li>search=[string]: search throught list by string (in chats case search by chat tag-name (shareName field) )</li>
              <li>have=[integer]: count of chats that you already have (default = 0)</li>
            </ul>
          </li>
          <li>Data params: none</li>
          <li>Success response:
            <ul>
              <li>Code: 200</li>Content: json paginated list
            </ul>
          </li>
          <li>Error response:
            <ul>
              <li>Code: 400 BAD REQUEST</li>Content:
              <code>{ error: "Bad Request" }</code>
            </ul>OR
            <ul>
              <li>Code: 401 UNAUTHORIZED</li>Content:
              <code>{ error: "Unauthorized" }</code>
            </ul>
          </li>
        </ul>
      </li>
      <li>GET (one chat)
        <ul>
          <li>
            URL:
            <code>/api/v2/chats/:id</code>
          </li>
          <li>URL params: required id=[string]</li>
          <li>Queries: none</li>
          <li>Data params: none</li>
          <li>Success response:
            <ul>
              <li>Code: 200</li>Content:
              chat object in json format
            </ul>
          </li>
          <li>Error response:
            <ul>
              <li>Code: 400 BAD REQUEST</li>Content:
              <code>{ error: "Bad Request" }</code>
            </ul>OR
            <ul>
              <li>Code: 401 UNAUTHORIZED</li>Content:
              <code>{ error: "Unauthorized" }</code>
            </ul>OR
            <ul>
              <li>Code: 403 FORBIDDEN</li>Content:
              <code>{ error: "Forbidden" }</code>
            </ul>OR
            <ul>
              <li>Code: 404 NOT FOUND</li>Content:
              <code>{ error: "Not Found" }</code>
            </ul>
          </li>
        </ul>
      </li>
      <li>GET (list of messages of current chat)
        <ul>
          <li>
            URL:
            <code>/api/v2/chats/:id/history</code>
          </li>
          <li>URL params: required id=[string]</li>
          <li>Queries:
            <ul>
              <li>search=[string]: search throught list by string (in this case, searches throughout message content field)</li>
              <li>have=[integer]: count of messages that you already have (default = 0)</li>
            </ul>
          </li>
          <li>Data params: none</li>
          <li>Success response:
            <ul>
              <li>Code: 200</li>Content: json paginated list
            </ul>
          </li>
          <li>Error response:
            <ul>
              <li>Code: 400 BAD REQUEST</li>Content:
              <code>{ error: "Bad Request" }</code>
            </ul>OR
            <ul>
              <li>Code: 401 UNAUTHORIZED</li>Content:
              <code>{ error: "Unauthorized" }</code>
            </ul>OR
            <ul>
              <li>Code: 403 FORBIDDEN</li>Content:
              <code>{ error: "Forbidden" }</code>
            </ul>
          </li>
        </ul>
      </li>
      <li>POST
        <ul>
          <li>
            URL:
            <code>/api/v2/chats</code>
          </li>
          <li>URL params: none</li>
          <li>Queries: none</li>
          <li>Data params: chatName=[string], shareName=[string], about=[string], image=[file], members=[ json array of strings (users id) ]</li>
          <li>Success response:
            <ul>
              <li>Code: 201</li>Content:
              created chat object
            </ul>
          </li>
          <li>Error response:
            <ul>
              <li>Code: 400 BAD REQUEST</li>Content:
              <code>{ error: "Bad Request" }</code>
            </ul>OR
            <ul>
              <li>Code: 401 UNAUTHORIZED</li>Content:
              <code>{ error: "Unauthorized" }</code>
            </ul>
          </li>
        </ul>
      </li>
      <li>PUT
        <ul>
          <li>
            URL:
            <code>/api/v2/chats/:id</code>
          </li>
          <li>URL params: required id=[string]</li>
          <li>Queries: none</li>
          <li>Data params: chatName=[string], about=[string], shareName=[string] optional: image=[file], members=[ json array of strings (users id) ]</li>
          <li>Success response:
            <ul>
              <li>Code: 200</li>Content:
              updated chat object
            </ul>
          </li>
          <li>Error response:
            <ul>
              <li>Code: 400 BAD REQUEST</li>Content:
              <code>{ error: "Bad Request" }</code>
            </ul>OR
            <ul>
              <li>Code: 401 UNAUTHORIZED</li>Content:
              <code>{ error: "Unauthorized" }</code>
            </ul>OR
            <ul>
              <li>Code: 404 NOT FOUND</li>Content:
              <code>{ error: "Not Found" }</code>
            </ul>OR
            <ul>
              <li>Code: 403 FORBIDDEN</li>Content:
              <code>{ error: "Forbidden" }</code>
            </ul>
          </li>
        </ul>
      </li>
      <li>DELETE
        <ul>
          <li>
            URL:
            <code>/api/v2/chats/:id</code>
          </li>
          <li>URL params: required id=[string]</li>
          <li>Queries: none</li>
          <li>Data params: none</li>
          <li>Success response:
            <ul>
              <li>Code: 200</li>Content: json format object with
              deleted chat object
            </ul>
          </li>
          <li>Error response:
            <ul>
              <li>Code: 400 BAD REQUEST</li>Content:
              <code>{ error: "Bad Request" }</code>
            </ul>OR
            <ul>
              <li>Code: 401 UNAUTHORIZED</li>Content:
              <code>{ error: "Unauthorized" }</code>
            </ul>OR
            <ul>
              <li>Code: 404 NOT FOUND</li>Content:
              <code>{ error: "Not Found" }</code>
            </ul>OR
            <ul>
              <li>Code: 403 FORBIDDEN</li>Content:
              <code>{ error: "Forbidden" }</code>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
    <h2>Authentication</h2>
    <hr>
    <p>
      Strategy: JWT
      <br>Headers:
      <code>Authorization: Bearer { jwt }</code>
    </p>
  </div>
</template>