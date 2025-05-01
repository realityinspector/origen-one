export OPENROUT
ER_API_KEY=
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

Email: admin@timepoint.ai
Password: admin123


OPENROUTER-INSTRUCITONS.MD
# OpenRouter Comprehensive Guide for AI Agents

## Core Concepts

**OpenRouter**: Unified API for accessing AI models from multiple providers through standardized interface.

**Key Benefits**:
- Multi-model, multi-provider access
- Price and performance optimization
- Standardized API across models
- Fallback support and smart routing
- Consolidated billing
- Higher availability and rate limits

## Setup and Authentication

### Python

```python
# Using OpenAI SDK
from openai import OpenAI

client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key="<OPENROUTER_API_KEY>",
)

# Direct API usage
import requests
import json

response = requests.post(
  url="https://openrouter.ai/api/v1/chat/completions",
  headers={
    "Authorization": "Bearer <OPENROUTER_API_KEY>",
    "HTTP-Referer": "<YOUR_SITE_URL>", # Optional for rankings
    "X-Title": "<YOUR_SITE_NAME>", # Optional for rankings
  },
  json={
    "model": "openai/gpt-4o",
    "messages": [{"role": "user", "content": "Query"}]
  }
)
```

### TypeScript

```typescript
// Using OpenAI SDK
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: '<OPENROUTER_API_KEY>',
});

// Direct API usage
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <OPENROUTER_API_KEY>',
    'Content-Type': 'application/json',
    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional for rankings
    'X-Title': '<YOUR_SITE_NAME>', // Optional for rankings
  },
  body: JSON.stringify({
    model: 'openai/gpt-4o',
    messages: [{ role: 'user', content: 'Query' }]
  })
});
```

## Model Routing

### Auto-Router

```javascript
{
  "model": "openrouter/auto",
  // Other parameters
}
```

### Fallback Models

```javascript
{
  "models": ["anthropic/claude-3.5-sonnet", "gryphe/mythomax-l2-13b"],
  // Other parameters
}
```

#### With OpenAI SDK (TypeScript)

```typescript
const completion = await client.chat.completions.create({
  model: 'openai/gpt-4o',
  models: ['anthropic/claude-3.5-sonnet', 'gryphe/mythomax-l2-13b'],
  messages: [{ role: 'user', content: 'Query' }]
});
```

#### With OpenAI SDK (Python)

```python
completion = client.chat.completions.create(
  model="openai/gpt-4o",
  models=["anthropic/claude-3.5-sonnet", "gryphe/mythomax-l2-13b"],
  messages=[{"role": "user", "content": "Query"}]
)
```

## Structured Outputs

Structured outputs allow enforcing specific JSON Schema validation on model responses, providing consistent, type-safe outputs that avoid parsing errors and hallucinated fields.

### Implementation

```javascript
{
  "messages": [{ "role": "user", "content": "Query" }],
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "example_schema",
      "strict": true,
      "schema": {
        "type": "object",
        "properties": {
          "field1": {
            "type": "string",
            "description": "Description of field1"
          },
          "field2": {
            "type": "number",
            "description": "Description of field2"
          }
        },
        "required": ["field1", "field2"],
        "additionalProperties": false
      }
    }
  }
}
```

### With TypeScript

```typescript
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <OPENROUTER_API_KEY>',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'openai/gpt-4',
    messages: [{ role: 'user', content: 'Query' }],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'example_schema',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            field1: { type: 'string', description: 'Description of field1' },
            field2: { type: 'number', description: 'Description of field2' }
          },
          required: ['field1', 'field2'],
          additionalProperties: false
        }
      }
    }
  })
});
const data = await response.json();
const structuredOutput = data.choices[0].message.content;
```

### With Python

```python
response = requests.post(
  url="https://openrouter.ai/api/v1/chat/completions",
  headers={
    "Authorization": f"Bearer <OPENROUTER_API_KEY>",
    "Content-Type": "application/json"
  },
  json={
    "model": "openai/gpt-4",
    "messages": [{"role": "user", "content": "Query"}],
    "response_format": {
      "type": "json_schema",
      "json_schema": {
        "name": "example_schema",
        "strict": True,
        "schema": {
          "type": "object",
          "properties": {
            "field1": {"type": "string", "description": "Description of field1"},
            "field2": {"type": "number", "description": "Description of field2"}
          },
          "required": ["field1", "field2"],
          "additionalProperties": False
        }
      }
    }
  }
)
structured_output = response.json()["choices"][0]["message"]["content"]
```

### Streaming with Structured Outputs

Structured outputs are also supported with streaming responses. The model streams valid partial JSON that, when complete, forms a valid response matching your schema.

```javascript
{
  "stream": true,
  "response_format": {
    "type": "json_schema",
    // Your schema
  }
}
```

## Tool & Function Calling

Tool calls (function calls) give an LLM access to external tools. The LLM suggests the tool to call, the user calls the tool separately and provides results back to the LLM, which then formats the response to the original question.

### Python Example

```python
import json, requests
from openai import OpenAI

openai_client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key="<OPENROUTER_API_KEY>",
)

# Define the tool
def search_tool(search_terms):
    # Implement tool logic here
    return {"results": ["result1", "result2"]}

tools = [
  {
    "type": "function",
    "function": {
      "name": "search_tool",
      "description": "Search for information based on specified terms",
      "parameters": {
        "type": "object",
        "properties": {
          "search_terms": {
            "type": "array",
            "items": {"type": "string"},
            "description": "List of search terms"
          }
        },
        "required": ["search_terms"]
      }
    }
  }
]

TOOL_MAPPING = {
    "search_tool": search_tool
}

# Initial request
messages = [{"role": "user", "content": "Query requiring search"}]
response_1 = openai_client.chat.completions.create(
    model="google/gemini-2.0-flash-001",
    tools=tools,
    messages=messages
).model_dump()['choices'][0]['message']

# Add response to messages
messages.append(response_1)

# Process tool calls
for tool_call in response_1.get('tool_calls', []):
    tool_name = tool_call['function']['name']
    tool_args = json.loads(tool_call['function']['arguments'])
    tool_response = TOOL_MAPPING[tool_name](**tool_args)
    messages.append({
      "role": "tool",
      "tool_call_id": tool_call['id'],
      "name": tool_name,
      "content": json.dumps(tool_response),
    })

# Final request with tool results
response_2 = openai_client.chat.completions.create(
    model="google/gemini-2.0-flash-001",
    tools=tools,
    messages=messages
)
```

### TypeScript Example

```typescript
import { OpenAI } from 'openai';

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: '<OPENROUTER_API_KEY>',
});

// Define the tool
function searchTool(searchTerms: string[]) {
  // Implement tool logic here
  return { results: ['result1', 'result2'] };
}

const tools = [
  {
    type: 'function',
    function: {
      name: 'searchTool',
      description: 'Search for information based on specified terms',
      parameters: {
        type: 'object',
        properties: {
          searchTerms: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of search terms'
          }
        },
        required: ['searchTerms']
      }
    }
  }
];

const toolMapping: Record<string, Function> = {
  'searchTool': searchTool
};

async function callWithTools() {
  // Initial request
  const messages = [{ role: 'user', content: 'Query requiring search' }];
  const response1 = await client.chat.completions.create({
    model: 'google/gemini-2.0-flash-001',
    tools,
    messages
  });
  
  const message1 = response1.choices[0].message;
  messages.push(message1);
  
  // Process tool calls
  if (message1.tool_calls) {
    for (const toolCall of message1.tool_calls) {
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments);
      const toolResponse = toolMapping[toolName](toolArgs.searchTerms);
      
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        name: toolName,
        content: JSON.stringify(toolResponse)
      });
    }
  }
  
  // Final request with tool results
  const response2 = await client.chat.completions.create({
    model: 'google/gemini-2.0-flash-001',
    tools,
    messages
  });
  
  return response2;
}
```

### Simple Agentic Loop (Python)

```python
def call_llm(msgs):
    resp = openai_client.chat.completions.create(
        model="google/gemini-2.0-flash-001",
        tools=tools,
        messages=msgs
    )
    msgs.append(resp.choices[0].message.dict())
    return resp

def get_tool_response(response):
    tool_call = response.choices[0].message.tool_calls[0]
    tool_name = tool_call.function.name
    tool_args = json.loads(tool_call.function.arguments)
    tool_result = TOOL_MAPPING[tool_name](**tool_args)
    return {
        "role": "tool",
        "tool_call_id": tool_call.id,
        "name": tool_name,
        "content": tool_result,
    }

messages = [{"role": "user", "content": "Query requiring search"}]
while True:
    resp = call_llm(messages)
    if resp.choices[0].message.tool_calls is not None:
        messages.append(get_tool_response(resp))
    else:
        break
```

## Sampling Parameters

OpenRouter allows customization of token generation through parameters:

```javascript
{
  "temperature": 1.0,       // 0.0-2.0, higher = more creative, default 1.0
  "top_p": 1.0,             // 0.0-1.0, dynamic token filtering, default 1.0
  "top_k": 0,               // 0+, limits token choices, default 0 (disabled)
  "frequency_penalty": 0.0, // -2.0-2.0, reduces repetition proportional to frequency, default 0.0
  "presence_penalty": 0.0,  // -2.0-2.0, reduces repetition based on presence, default 0.0
  "repetition_penalty": 1.0,// 0.0-2.0, reduces repetition, default 1.0
  "min_p": 0.0,             // 0.0-1.0, minimum token probability relative to best, default 0.0
  "top_a": 0.0,             // 0.0-1.0, dynamic top-p based on highest probability, default 0.0
  "seed": 12345,            // Integer for deterministic sampling
  "max_tokens": 4096,       // Maximum tokens to generate
  "logit_bias": {           // Token ID to bias value (-100 to 100)
    "50256": -100           // Example: reducing likelihood of token 50256
  },
  "logprobs": true,         // Whether to return log probabilities
  "top_logprobs": 5         // Number of most likely tokens to return (0-20)
}
```

## Web Search

Enable web search for any model:

```javascript
{
  "model": "openai/gpt-4o:online"
}
```

Equivalent to:

```javascript
{
  "model": "openrouter/auto",
  "plugins": [{ "id": "web" }]
}
```

Custom configurations:

```javascript
{
  "model": "openai/gpt-4o:online",
  "plugins": [
    {
      "id": "web",
      "max_results": 3,  // Default: 5
      "search_prompt": "Custom prompt introducing search results:"
    }
  ]
}
```

Pricing: $4 per 1000 results ($0.02 for default 5 results).

## Streaming

Enable streaming for any model:

### Python

```python
import requests
import json

url = "https://openrouter.ai/api/v1/chat/completions"
headers = {
  "Authorization": "Bearer <OPENROUTER_API_KEY>",
  "Content-Type": "application/json"
}

payload = {
  "model": "openai/gpt-4o",
  "messages": [{"role": "user", "content": "Query"}],
  "stream": True
}

buffer = ""
with requests.post(url, headers=headers, json=payload, stream=True) as r:
  for chunk in r.iter_content(chunk_size=1024, decode_unicode=True):
    buffer += chunk
    while True:
      line_end = buffer.find('\n')
      if line_end == -1:
        break

      line = buffer[:line_end].strip()
      buffer = buffer[line_end + 1:]

      if line.startswith('data: '):
        data = line[6:]
        if data == '[DONE]':
          break

        try:
          data_obj = json.loads(data)
          content = data_obj["choices"][0]["delta"].get("content")
          if content:
            print(content, end="", flush=True)
        except json.JSONDecodeError:
          pass
```

### TypeScript

```typescript
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <OPENROUTER_API_KEY>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'openai/gpt-4o',
    messages: [{ role: 'user', content: 'Query' }],
    stream: true
  })
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();
let buffer = '';

while (reader) {
  const { done, value } = await reader.read();
  if (done) break;
  
  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('data: ')) {
      const data = trimmedLine.slice(6);
      if (data === '[DONE]') break;
      
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices[0].delta.content;
        if (content) process.stdout.write(content);
      } catch (e) {
        // Handle parsing errors
      }
    }
  }
}
```

### Stream Cancellation

Python:

```python
import requests
from threading import Event, Thread

def stream_with_cancellation(prompt: str, cancel_event: Event):
    with requests.Session() as session:
        response = session.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={"Authorization": f"Bearer <OPENROUTER_API_KEY>"},
            json={"model": "openai/gpt-4o", "messages": [{"role": "user", "content": prompt}], "stream": True},
            stream=True
        )

        try:
            for line in response.iter_lines():
                if cancel_event.is_set():
                    response.close()
                    return
                if line:
                    print(line.decode(), end="", flush=True)
        finally:
            response.close()

# Usage
cancel_event = Event()
stream_thread = Thread(target=lambda: stream_with_cancellation("Query", cancel_event))
stream_thread.start()

# To cancel
cancel_event.set()
```

TypeScript:

```typescript
const controller = new AbortController();
const { signal } = controller;

fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <OPENROUTER_API_KEY>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'openai/gpt-4o',
    messages: [{ role: 'user', content: 'Query' }],
    stream: true
  }),
  signal
})
.then(response => {
  // Process stream
})
.catch(err => {
  if (err.name === 'AbortError') {
    console.log('Fetch aborted');
  } else {
    console.error('Error:', err);
  }
});

// To cancel
controller.abort();
```

## Prompt Caching

Reduces token costs by caching prompts:

### OpenAI
- Cache writes: no cost
- Cache reads: 0.5x input price
- Automated, minimum 1024 tokens

### Anthropic Claude
- Cache writes: 1.25x input price
- Cache reads: 0.1x input price
- Requires cache_control breakpoints:

```javascript
{
  "messages": [
    {
      "role": "system",
      "content": [
        {
          "type": "text",
          "text": "Introduction"
        },
        {
          "type": "text",
          "text": "LARGE TEXT TO CACHE",
          "cache_control": {
            "type": "ephemeral"
          }
        }
      ]
    },
    {
      "role": "user",
      "content": [{"type": "text", "text": "Query"}]
    }
  ]
}
```

### DeepSeek
- Cache writes: same as input price
- Cache reads: 0.1x input price
- Automated

## Message Transforms

Compress prompts exceeding context limits:

```javascript
{
  "transforms": ["middle-out"], // Compress prompts exceeding context size
  "messages": [...],
  "model": "any-model"
}
```

All OpenRouter endpoints with ≤8k context default to middle-out. Disable with `transforms: []`.

## Rate Limits

Check limits and credits:

```javascript
// GET https://openrouter.ai/api/v1/auth/key
fetch('https://openrouter.ai/api/v1/auth/key', {
  method: 'GET',
  headers: {
    Authorization: 'Bearer <OPENROUTER_API_KEY>'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

Response:

```javascript
{
  "data": {
    "label": "key-name",
    "usage": 10.5, // Credits used
    "limit": 100,  // Credit limit or null if unlimited
    "is_free_tier": false,
    "rate_limit": {
      "requests": 10,
      "interval": "1s"
    }
  }
}
```

Rate limits based on credits:
- 0.5 credits → 1 req/s (minimum)
- 5 credits → 5 req/s
- 10 credits → 10 req/s
- 500 credits → 500 req/s
- 1000+ credits → Contact support if rate limited

Free models (`:free` suffix): 20 req/min, 200 req/day.