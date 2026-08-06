with open('src/pages/Auth.tsx', 'r') as f:
    code = f.read()

code = code.replace("        }\n        )}\n      </div>\n    </div>\n  );", "        </div>\n      </div>\n    </div>\n  );")
code = code.replace("        </div>\n        )}\n      </div>\n    </div>\n  );", "        </div>\n      </div>\n    </div>\n  );")
with open('src/pages/Auth.tsx', 'w') as f:
    f.write(code)
