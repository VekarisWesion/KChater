/*
    SPDX-FileCopyrightText: 2023 Denys Madureira <denysmb@zoho.com>
    SPDX-License-Identifier: LGPL-2.1-or-later
*/

.pragma library

var _activeXhr = null;

function abortActiveRequest() {
    if (_activeXhr) {
        _activeXhr.onreadystatechange = function() {};
        _activeXhr.onload = function() {};
        _activeXhr.abort();
        _activeXhr = null;
        return true;
    }
    return false;
}

function requestOllama(modelsComboboxCurrentValue, promptArray, listModel, onStreaming, onComplete, thinkingEnabled, mcpFunctions) {
    const oldLength = listModel.count;
    const url = 'http://127.0.0.1:11434/api/chat';

    let requestData = {
        "model": modelsComboboxCurrentValue,
        "keep_alive": "5m",
        "stream": true,
        "options": {},
        "messages": promptArray.map(function(m) {
            let msg = { "role": m.role, "content": m.content };
            if (m.images && m.images.length > 0) {
                msg["images"] = m.images;
            }
            if (m.tool_calls) {
                msg["tool_calls"] = m.tool_calls;
            }
            if (m.tool_call_id) {
                msg["tool_call_id"] = m.tool_call_id;
            }
            return msg;
        })
    };

    if (thinkingEnabled === true) {
        requestData["think"] = true;
    }

    if (mcpFunctions && mcpFunctions.length > 0) {
        requestData["tools"] = mcpFunctions.map(function(f) {
            return {
                type: "function",
                function: {
                    name: f.name,
                    description: f.description,
                    parameters: f.parameters
                }
            };
        });
    }

    const data = JSON.stringify(requestData);

    let xhr = new XMLHttpRequest();
    _activeXhr = xhr;

    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    let processedLength = 0;
    let accumulatedText = '';
    let accumulatedThinking = '';
    let toolCalls = {};
    let hasToolCalls = false;

    let errorDetected = false;

    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.LOADING || xhr.readyState === XMLHttpRequest.DONE) {
            const response = xhr.responseText;

            if (response.length > processedLength) {
                const newChunk = response.substring(processedLength);
                processedLength = response.length;

                const lines = newChunk.split('\n');
                let hasUpdate = false;

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    try {
                        const parsedObject = JSON.parse(line);

                        if (parsedObject.error) {
                            errorDetected = true;
                            accumulatedText = parsedObject.error;
                            hasUpdate = true;
                            continue;
                        }

                        const content = parsedObject?.message?.content;
                        const thinking = parsedObject?.message?.thinking;
                        const msgToolCalls = parsedObject?.message?.tool_calls;
                        const doneReason = parsedObject?.done_reason;

                        if (content) {
                            accumulatedText += content;
                            hasUpdate = true;
                        }
                        if (thinking) {
                            accumulatedThinking += thinking;
                            hasUpdate = true;
                        }
                        if (msgToolCalls && msgToolCalls.length > 0) {
                            hasToolCalls = true;
                            for (let tc = 0; tc < msgToolCalls.length; tc++) {
                                const tcItem = msgToolCalls[tc];
                                const tcIndex = tc;
                                if (!toolCalls[tcIndex]) {
                                    toolCalls[tcIndex] = {
                                        id: tcItem.id || ("ollama_tc_" + tcIndex),
                                        type: "function",
                                        function: {
                                            name: "",
                                            arguments: ""
                                        }
                                    };
                                }
                                if (tcItem.id) {
                                    toolCalls[tcIndex].id = tcItem.id;
                                }
                                if (tcItem.function) {
                                    if (tcItem.function.name) {
                                        toolCalls[tcIndex].function.name = tcItem.function.name;
                                    }
                                    if (tcItem.function.arguments) {
                                        if (typeof tcItem.function.arguments === 'string') {
                                            toolCalls[tcIndex].function.arguments += tcItem.function.arguments;
                                        } else {
                                            toolCalls[tcIndex].function.arguments = tcItem.function.arguments;
                                        }
                                    }
                                }
                            }
                        }
                        if (doneReason === 'tool_calls') {
                            hasToolCalls = true;
                        }
                    } catch (e) {
                        // Skip invalid JSON
                    }
                }

                if (hasUpdate && typeof onStreaming === 'function') {
                    onStreaming(accumulatedText, oldLength, listModel, accumulatedThinking);
                }
            }
        }

        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (typeof onComplete === 'function') {
                if (xhr.status !== 200 && !errorDetected && accumulatedText === '') {
                    accumulatedText = 'Ollama error: HTTP ' + xhr.status;
                    if (xhr.responseText) {
                        try {
                            const errObj = JSON.parse(xhr.responseText);
                            if (errObj.error) {
                                accumulatedText = errObj.error;
                            }
                        } catch (e) {}
                    }
                }
                let finalToolCalls = [];
                if (hasToolCalls && !errorDetected) {
                    let tcKeys = Object.keys(toolCalls);
                    for (let k = 0; k < tcKeys.length; k++) {
                        finalToolCalls.push(toolCalls[tcKeys[k]]);
                    }
                }
                onComplete(oldLength, listModel, accumulatedText, finalToolCalls);
            }
        }
    };

    xhr.send(data);
    return xhr;
}

// Servers disagree on how reasoning is switched on and off, so the provider
// picks a convention (see SettingsOpenAICompatible). "auto" guesses from the
// base URL; "vllm" is the behaviour this client had before the setting existed.
function resolveReasoningStyle(style, baseUrl) {
    if (style && style.length > 0 && style !== "auto") {
        return style;
    }
    const url = (baseUrl || "").toLowerCase();
    if (url.indexOf("deepseek") !== -1) {
        return "deepseek";
    }
    // Self-hosted servers (vLLM, LM Studio, llama.cpp, ...) understand the
    // template flag. Anything else gets nothing at all: an unknown field can
    // make a strict server reject the whole request, and the model's default is
    // a better fallback than a failed call. Pick a style explicitly for those.
    if (url.indexOf("localhost") !== -1 || url.indexOf("127.0.0.1") !== -1
            || url.indexOf("[::1]") !== -1 || url.indexOf("0.0.0.0") !== -1
            || url.indexOf("vllm") !== -1) {
        return "vllm";
    }
    return "none";
}

function applyReasoningParams(requestData, style, thinkingEnabled, customJson) {
    if (style === "deepseek") {
        // https://api-docs.deepseek.com: thinking.type is enabled/disabled.
        requestData["thinking"] = { "type": thinkingEnabled === true ? "enabled" : "disabled" };
    } else if (style === "vllm") {
        requestData["chat_template_kwargs"] = { "enable_thinking": thinkingEnabled === true };
    } else if (style === "custom" && customJson) {
        // __THINKING__ is replaced with true/false before parsing.
        try {
            const json = customJson.replace(/__THINKING__/g, thinkingEnabled === true ? "true" : "false");
            const parsed = JSON.parse(json);
            for (const key in parsed) {
                if (Object.prototype.hasOwnProperty.call(parsed, key)) {
                    requestData[key] = parsed[key];
                }
            }
        } catch (e) {
            // A malformed custom template is ignored rather than breaking the request.
        }
    }
    // "none" deliberately sends nothing and lets the server use its default.
}

function requestOpenAICompatible(baseUrl, token, model, promptArray, thinkingEnabled, extraHeaders, includeV1, listModel, onStreaming, onComplete, mcpFunctions, reasoningStyle, reasoningCustom) {
    const oldLength = listModel.count;
    let url = baseUrl.replace(/\/$/, '');
    if (includeV1) {
        url += '/v1';
    }
    url += '/chat/completions';

    let requestData = {
        "model": model,
        "messages": promptArray.map(function(m) {
            let msg = { "role": m.role };
            if (m.images && m.images.length > 0) {
                let parts = [];
                if (m.content) {
                    parts.push({ "type": "text", "text": m.content });
                }
                for (let i = 0; i < m.images.length; i++) {
                    const mime = (m.imageMimes && m.imageMimes[i]) || "image/png";
                    parts.push({
                        "type": "image_url",
                        "image_url": { "url": "data:" + mime + ";base64," + m.images[i] }
                    });
                }
                msg["content"] = parts;
            } else {
                msg["content"] = m.content;
            }
            if (m.tool_calls) {
                msg["tool_calls"] = m.tool_calls;
            }
            if (m.tool_call_id) {
                msg["tool_call_id"] = m.tool_call_id;
            }
            return msg;
        }),
        "stream": true
    };

    applyReasoningParams(requestData, resolveReasoningStyle(reasoningStyle, baseUrl), thinkingEnabled, reasoningCustom);

    if (mcpFunctions && mcpFunctions.length > 0) {
        requestData["tools"] = mcpFunctions.map(function(f) {
            return {
                type: "function",
                function: {
                    name: f.name,
                    description: f.description,
                    parameters: f.parameters
                }
            };
        });
    }

    const data = JSON.stringify(requestData);

    let xhr = new XMLHttpRequest();
    _activeXhr = xhr;

    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);

    if (extraHeaders) {
        for (const [key, value] of Object.entries(extraHeaders)) {
            xhr.setRequestHeader(key, value);
        }
    }

    let text = '';
    let thinkingText = '';
    let processedLength = 0;
    let toolCalls = {};
    let hasToolCalls = false;

    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.LOADING || xhr.readyState === XMLHttpRequest.DONE) {
            const response = xhr.responseText;

            if (response.length > processedLength) {
                const newChunk = response.substring(processedLength);
                processedLength = response.length;

                const lines = newChunk.split('\n');

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();

                    if (line.startsWith('data: ')) {
                        const dataStr = line.substring(6);

                        if (dataStr === '[DONE]') {
                            continue;
                        }

                        try {
                            const parsed = JSON.parse(dataStr);
                            const choices = parsed.choices;
                            if (choices && choices.length > 0) {
                                const delta = choices[0].delta;
                                const finishReason = choices[0].finish_reason;
                                if (delta) {
                                    let hasUpdate = false;

                                    if (delta.reasoning_content) {
                                        thinkingText += delta.reasoning_content;
                                        hasUpdate = true;
                                    }

                                    if (delta.reasoning) {
                                        thinkingText += delta.reasoning;
                                        hasUpdate = true;
                                    }

                                    if (delta.content) {
                                        text += delta.content;
                                        hasUpdate = true;
                                    }

                                    if (delta.tool_calls) {
                                        hasToolCalls = true;
                                        for (var tc = 0; tc < delta.tool_calls.length; tc++) {
                                            var toolCall = delta.tool_calls[tc];
                                            var tcIndex = toolCall.index !== undefined ? toolCall.index : tc;
                                            if (!toolCalls[tcIndex]) {
                                                toolCalls[tcIndex] = {
                                                    id: toolCall.id || "",
                                                    type: "function",
                                                    function: {
                                                        name: "",
                                                        arguments: ""
                                                    }
                                                };
                                            }
                                            if (toolCall.id) {
                                                toolCalls[tcIndex].id = toolCall.id;
                                            }
                                            if (toolCall.function) {
                                                if (toolCall.function.name) {
                                                    toolCalls[tcIndex].function.name += toolCall.function.name;
                                                }
                                                if (toolCall.function.arguments) {
                                                    toolCalls[tcIndex].function.arguments += toolCall.function.arguments;
                                                }
                                            }
                                        }
                                    }

                                    if (hasUpdate && typeof onStreaming === 'function') {
                                        onStreaming(text, oldLength, listModel, thinkingText);
                                    }
                                }

                                if (finishReason === 'tool_calls') {
                                    hasToolCalls = true;
                                }
                            }
                        } catch (e) {
                            // Skip invalid JSON
                        }
                    }
                }
            }
        }

        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (typeof onComplete === 'function') {
                // Without this the caller only ever sees an empty message when the
                // server answers with an error status (bad key, rate limit, an
                // unsupported parameter, ...).
                if (xhr.status !== 200 && text === '' && thinkingText === '') {
                    text = 'HTTP ' + xhr.status;
                    if (xhr.responseText) {
                        try {
                            const errObj = JSON.parse(xhr.responseText);
                            if (errObj && errObj.error) {
                                text = errObj.error.message || errObj.error.code || text;
                            }
                        } catch (e) {
                            text = xhr.responseText.substring(0, 500);
                        }
                    }
                }
                var finalToolCalls = [];
                if (hasToolCalls) {
                    var tcKeys = Object.keys(toolCalls);
                    for (var k = 0; k < tcKeys.length; k++) {
                        finalToolCalls.push(toolCalls[tcKeys[k]]);
                    }
                }
                onComplete(oldLength, listModel, text, finalToolCalls);
            }
        }
    };

    xhr.send(data);
    return xhr;
}

function getOllamaModels(onSuccess, onError) {
    const url = 'http://127.0.0.1:11434/api/tags';

    let xhr = new XMLHttpRequest();

    xhr.open('GET', url);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                const objects = JSON.parse(xhr.responseText).models;
                const models = objects.map(object => object.model);
                if (typeof onSuccess === 'function') {
                    onSuccess(models);
                }
            } else {
                if (typeof onError === 'function') {
                    onError(xhr.status, xhr.statusText);
                }
            }
        }
    };

    xhr.send();
}

function preprocessMarkdown(text) {
    return text
        .replace(/^#{1,6}\s+(.+)$/gm, '**$1**')
        .replace(/\*\*\*([^*]+)\*\*\*/g, '**$1**')
        .replace(/___([^_]+)___/g, '*$1*');
}

function testConnection(providerType, baseUrl, token, model, extraHeaders, includeV1, onSuccess, onError) {
    var cleanUrl = baseUrl.replace(/\/$/, '');

    if (providerType === "ollama") {
        var url = cleanUrl + "/api/tags";
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    try {
                        var response = JSON.parse(xhr.responseText);
                        var modelCount = response.models ? response.models.length : 0;
                        if (typeof onSuccess === "function") {
                            onSuccess({ modelCount: modelCount });
                        }
                    } catch (e) {
                        if (typeof onSuccess === "function") {
                            onSuccess({ modelCount: 0 });
                        }
                    }
                } else {
                    if (typeof onError === "function") {
                        var statusText = xhr.statusText || "UNKNOWN";
                        if (xhr.status === 0) statusText = "NETWORK_ERROR";
                        else if (xhr.status === 401) statusText = "UNAUTHORIZED";
                        else if (xhr.status === 404) statusText = "NOT_FOUND";
                        onError({ status: xhr.status, statusText: statusText });
                    }
                }
            }
        };

        xhr.send();
        return xhr;
    }

    var url = cleanUrl;
    if (includeV1 && !cleanUrl.endsWith("/v1")) {
        url = cleanUrl + "/v1";
    }
    url += "/chat/completions";

    var data = JSON.stringify({
        "model": model,
        "messages": [{"role": "user", "content": "hi"}],
        "max_tokens": 1
    });

    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    if (token) {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
    }

    if (extraHeaders) {
        var keys = Object.keys(extraHeaders);
        for (var i = 0; i < keys.length; i++) {
            xhr.setRequestHeader(keys[i], extraHeaders[i]);
        }
    }

    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (typeof onSuccess === "function") {
                    onSuccess({ modelCount: 0 });
                }
            } else {
                if (typeof onError === "function") {
                    var statusText = xhr.statusText || "UNKNOWN";
                    if (xhr.status === 0) statusText = "NETWORK_ERROR";
                    else if (xhr.status === 401) statusText = "UNAUTHORIZED";
                    else if (xhr.status === 404) statusText = "NOT_FOUND";
                    onError({ status: xhr.status, statusText: statusText });
                }
            }
        }
    };

    xhr.send(data);
    return xhr;
}

function parseTextToComboBox(text) {
    return text
        .replace(/-/g, ' ')
        .replace(/:(.+)/, ' ($1)')
        .split(' ')
        .map(word => {
            if (word.startsWith('(')) {
                return word.charAt(0) + word.charAt(1).toUpperCase() + word.slice(2);
            }
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
}
