package com.myapp.services;

import ai.onnxruntime.*;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.enterprise.context.ApplicationScoped;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.*;

@ApplicationScoped
public class ClipMonumentService {

    private OrtEnvironment env;
    private OrtSession visionSession;
    private OrtSession textSession;
    
    private static final int IMG_SIZE = 224;
    
    private String[] monuments;
    private long[][] precomputedTokens;
    private float[][] textEmbeddings;

    @PostConstruct
    public void init() {
        try {
            env = OrtEnvironment.getEnvironment();
            
            loadPrecomputedTokens();
            
            InputStream visionStream = getClass().getResourceAsStream("/clip_vision.onnx");
            InputStream textStream = getClass().getResourceAsStream("/clip_text.onnx");
            
            if (visionStream == null || textStream == null) {
                throw new RuntimeException("Modèles CLIP non trouvés");
            }
            
            visionSession = env.createSession(visionStream.readAllBytes());
            textSession = env.createSession(textStream.readAllBytes());
            
            precomputeTextEmbeddings();
            
            System.out.println("✓ CLIP chargé - " + monuments.length + " monuments");
            
        } catch (Exception e) {
            throw new RuntimeException("Erreur chargement CLIP", e);
        }
    }
    
    private void loadPrecomputedTokens() throws Exception {
        InputStream tokensStream = getClass().getResourceAsStream("/monuments_tokens.json");
        if (tokensStream == null) {
            throw new RuntimeException("monuments_tokens.json non trouvé");
        }
        
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(tokensStream);
        
        JsonNode monumentsNode = root.get("monuments");
        JsonNode tokensNode = root.get("tokens");
        
        int count = monumentsNode.size();
        monuments = new String[count];
        precomputedTokens = new long[count][77];
        
        for (int i = 0; i < count; i++) {
            monuments[i] = monumentsNode.get(i).asText();
            JsonNode tokenArray = tokensNode.get(i);
            for (int j = 0; j < 77; j++) {
                precomputedTokens[i][j] = tokenArray.get(j).asLong();
            }
        }
        
        System.out.println("✓ Tokens pré-calculés chargés");
    }
    
    private void precomputeTextEmbeddings() throws Exception {
        textEmbeddings = new float[monuments.length][];
        
        for (int i = 0; i < monuments.length; i++) {
            textEmbeddings[i] = encodeText(precomputedTokens[i]);
            normalize(textEmbeddings[i]);
        }
        
        System.out.println("✓ Text embeddings précalculés");
    }
    
    private float[] encodeText(long[] tokens) throws Exception {
        long[][] tokensBatch = new long[1][77];
        tokensBatch[0] = tokens;
        
        OnnxTensor inputTensor = OnnxTensor.createTensor(env, tokensBatch);
        Map<String, OnnxTensor> inputs = Collections.singletonMap("input_ids", inputTensor);
        
        OrtSession.Result results = textSession.run(inputs);
        float[][] output = (float[][]) results.get(0).getValue();
        
        inputTensor.close();
        results.close();
        
        return output[0];
    }

    public Map<String, Object> recognizeMonument(byte[] imageBytes) throws Exception {
        System.out.println("Taille image reçue: " + imageBytes.length + " bytes");
        
        BufferedImage image = null;
        ByteArrayInputStream bais = new ByteArrayInputStream(imageBytes);
        
        try {
            image = ImageIO.read(bais);
        } catch (Exception e) {
            System.err.println("Erreur lecture image: " + e.getMessage());
            e.printStackTrace();
        }
        
        if (image == null) {
            System.err.println("ImageIO.read a retourné null - tentative de conversion forcée");
            
            bais.reset();
            try {
                javax.imageio.ImageReader reader = ImageIO.getImageReadersBySuffix("jpg").next();
                reader.setInput(ImageIO.createImageInputStream(bais));
                image = reader.read(0);
            } catch (Exception e2) {
                System.err.println("Conversion forcée échouée: " + e2.getMessage());
                throw new IllegalArgumentException("Format d'image non supporté. Utilisez JPG, PNG ou GIF");
            }
        }
        
        if (image == null) {
            throw new IllegalArgumentException("Impossible de décoder l'image");
        }
        
        System.out.println("Image chargée: " + image.getWidth() + "x" + image.getHeight());

        BufferedImage resized = new BufferedImage(IMG_SIZE, IMG_SIZE, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = resized.createGraphics();
        graphics.drawImage(image, 0, 0, IMG_SIZE, IMG_SIZE, null);
        graphics.dispose();

        float[][][][] inputData = new float[1][3][IMG_SIZE][IMG_SIZE];
        float[] mean = {0.48145466f, 0.4578275f, 0.40821073f};
        float[] std = {0.26862954f, 0.26130258f, 0.27577711f};

        for (int y = 0; y < IMG_SIZE; y++) {
            for (int x = 0; x < IMG_SIZE; x++) {
                int rgb = resized.getRGB(x, y);
                float red = ((rgb >> 16) & 0xFF) / 255.0f;
                float green = ((rgb >> 8) & 0xFF) / 255.0f;
                float blue = (rgb & 0xFF) / 255.0f;
                
                inputData[0][0][y][x] = (red - mean[0]) / std[0];
                inputData[0][1][y][x] = (green - mean[1]) / std[1];
                inputData[0][2][y][x] = (blue - mean[2]) / std[2];
            }
        }

        OnnxTensor inputTensor = OnnxTensor.createTensor(env, inputData);
        Map<String, OnnxTensor> inputs = Collections.singletonMap("pixel_values", inputTensor);
        
        OrtSession.Result results = visionSession.run(inputs);
        float[][] imageEmbedding = (float[][]) results.get(0).getValue();
        
        normalize(imageEmbedding[0]);
        
        float[] similarities = new float[monuments.length];
        for (int i = 0; i < monuments.length; i++) {
            similarities[i] = dotProduct(imageEmbedding[0], textEmbeddings[i]);
        }
        
        softmax(similarities);
        
        int bestIdx = argmax(similarities);
        
        Map<String, Object> response = new HashMap<>();
        String fullMonument = monuments[bestIdx];
        Map<String, String> parsedInfo = parseMonumentInfo(fullMonument);
        
        response.put("monument", parsedInfo.get("monument"));
        response.put("city", parsedInfo.get("city"));
        response.put("country", parsedInfo.get("country"));
        response.put("confidence", similarities[bestIdx]);
        
        List<Map<String, Object>> topResults = new ArrayList<>();
        int[] topIndices = topK(similarities, 5);
        for (int idx : topIndices) {
            Map<String, Object> r = new HashMap<>();
            Map<String, String> info = parseMonumentInfo(monuments[idx]);
            r.put("monument", info.get("monument"));
            r.put("city", info.get("city"));
            r.put("country", info.get("country"));
            r.put("confidence", similarities[idx]);
            topResults.add(r);
        }
        response.put("top5", topResults);
        
        inputTensor.close();
        results.close();
        
        return response;
    }
    
    private Map<String, String> parseMonumentInfo(String fullName) {
        Map<String, String> info = new HashMap<>();
        
        // Format: "Monument, City" or just "Monument"
        String[] parts = fullName.split(",");
        info.put("monument", parts[0].trim());
        info.put("city", parts.length > 1 ? parts[1].trim() : "");
        
        // Map cities to countries
        String city = info.get("city");
        String country = getCityCountry(city);
        info.put("country", country);
        
        return info;
    }
    
    private String getCityCountry(String city) {
        Map<String, String> cityToCountry = new HashMap<>();
        cityToCountry.put("Paris", "France");
        cityToCountry.put("Versailles", "France");
        cityToCountry.put("Normandie", "France");
        cityToCountry.put("Loire", "France");
        cityToCountry.put("Nîmes", "France");
        cityToCountry.put("Carcassonne", "France");
        cityToCountry.put("Rome", "Italie");
        cityToCountry.put("Pise", "Italie");
        cityToCountry.put("Londres", "Royaume-Uni");
        cityToCountry.put("New York", "États-Unis");
        cityToCountry.put("San Francisco", "États-Unis");
        cityToCountry.put("Agra", "Inde");
        cityToCountry.put("Chine", "Chine");
        cityToCountry.put("Sydney", "Australie");
        cityToCountry.put("Rio de Janeiro", "Brésil");
        cityToCountry.put("Pérou", "Pérou");
        cityToCountry.put("Le Caire", "Égypte");
        cityToCountry.put("Jordanie", "Jordanie");
        cityToCountry.put("Athènes", "Grèce");
        cityToCountry.put("Barcelone", "Espagne");
        cityToCountry.put("Grenade", "Espagne");
        cityToCountry.put("Bavière", "Allemagne");
        
        return cityToCountry.getOrDefault(city, "");
    }
    
    private void normalize(float[] vec) {
        float norm = 0;
        for (float v : vec) norm += v * v;
        norm = (float) Math.sqrt(norm);
        for (int i = 0; i < vec.length; i++) vec[i] /= norm;
    }
    
    private float dotProduct(float[] a, float[] b) {
        float sum = 0;
        for (int i = 0; i < a.length; i++) sum += a[i] * b[i];
        return sum;
    }
    
    private void softmax(float[] arr) {
        float max = Float.NEGATIVE_INFINITY;
        for (float v : arr) if (v > max) max = v;
        
        float sum = 0;
        for (int i = 0; i < arr.length; i++) {
            arr[i] = (float) Math.exp(arr[i] - max);
            sum += arr[i];
        }
        for (int i = 0; i < arr.length; i++) arr[i] /= sum;
    }
    
    private int argmax(float[] arr) {
        int maxIdx = 0;
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] > arr[maxIdx]) maxIdx = i;
        }
        return maxIdx;
    }
    
    private int[] topK(float[] arr, int k) {
        Integer[] indices = new Integer[arr.length];
        for (int i = 0; i < arr.length; i++) indices[i] = i;
        Arrays.sort(indices, (a, b) -> Float.compare(arr[b], arr[a]));
        int[] result = new int[k];
        for (int i = 0; i < k; i++) result[i] = indices[i];
        return result;
    }

    @PreDestroy
    public void cleanup() {
        try {
            if (visionSession != null) visionSession.close();
            if (textSession != null) textSession.close();
            if (env != null) env.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
