package com.backend.crazy8s;

import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class RulesetFactory {

    private final Map<String, Ruleset> rulesets;
    
    public RulesetFactory(Map<String, Ruleset> rulesets) {
        this.rulesets = rulesets;
    }

    public Ruleset get(String type) {
        Ruleset ruleset = rulesets.get(type);
        if (ruleset == null) {
            throw new IllegalArgumentException("Unknown ruleset: " + type);
        }
        return ruleset;
    }
}
