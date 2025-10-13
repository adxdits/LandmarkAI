package com.myapp.resources;

import com.myapp.services.LLMService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/chat")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Chat", description = "LLM Chat endpoints")
public class ChatResource {

    @Inject
    LLMService llmService;

    @POST
    @Operation(
        summary = "Generate text using local LLM",
        description = "Sends a prompt to the LLaMA model and returns generated text"
    )
    @APIResponse(
        responseCode = "200",
        description = "Text generated successfully",
        content = @Content(schema = @Schema(implementation = ChatResponse.class))
    )
    @APIResponse(
        responseCode = "400",
        description = "Invalid prompt"
    )
    public ChatResponse chat(ChatRequest request) {
        String response = llmService.generateText(request.prompt());
        return new ChatResponse(response);
    }

    @Schema(description = "Chat request with user prompt")
    public record ChatRequest(
        @Schema(description = "The prompt to send to the LLM", example = "Describe Paris in one sentence.")
        String prompt
    ) {}

    @Schema(description = "Chat response from the LLM")
    public record ChatResponse(
        @Schema(description = "The generated text response")
        String response
    ) {}
}
