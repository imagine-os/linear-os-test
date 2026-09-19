# Issue contract audit, 2026-09-19 (PAP-93, live, read-only)

Output of `pnpm contract:audit` (whole team) and `pnpm contract:audit --state Backlog` against live team PAP on 2026-09-19 ~02:18Z, mode `build-loop`. Evidence for the PAP-93 Definition of done; nothing in Linear was moved, labelled or commented by these runs.

### Issue contract audit — whole team, mode build-loop, 2026-09-19T02:17Z

1021 issue(s); 1 with contract (shape) errors; 834 blocked/unclaimable only (`BLOCKED_BY_OPEN`, `READY_BUT_BLOCKED`, `UMBRELLA_NOT_CLAIMABLE`); 179 warnings only; 7 clean.

Pre-promotion list: 7 of 848 Backlog issue(s) promotable now (zero errors, leaf, not Deferred): PAP-105, PAP-227, PAP-239, PAP-284, PAP-644, PAP-695, PAP-701.

| State | Issues | With errors | Warnings only | Clean |
|---|---:|---:|---:|---:|
| Backlog | 848 | 835 | 13 | 0 |
| Triage | 112 | 0 | 112 | 0 |
| In Progress | 15 | 0 | 15 | 0 |
| Ready for Claude | 15 | 0 | 15 | 0 |
| Done | 14 | 0 | 14 | 0 |
| In Review | 9 | 0 | 9 | 0 |
| Duplicate | 7 | 0 | 0 | 7 |
| Needs Justin | 1 | 0 | 1 | 0 |

| Code | As error | As warning |
|---|---:|---:|
| `BLOCKED_BY_OPEN` | 834 | 0 |
| `LABEL_PHASE` | 1 | 112 |
| `MISSING_SECTION` | 1 | 31 |
| `LABEL_TYPE` | 1 | 30 |
| `LABEL_SURFACE` | 1 | 30 |
| `LABEL_CHARACTER` | 0 | 1014 |
| `NO_SPEC_LINK` | 0 | 116 |
| `BAD_SIZE` | 0 | 82 |

| Issue | State | Errors | Warnings | Note |
|---|---|---|---|---|
| PAP-5 | Backlog | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` | `MISSING_SECTION` `LABEL_CHARACTER` |  |
| PAP-6 | Duplicate | — | — |  |
| PAP-7 | Duplicate | — | — |  |
| PAP-8 | Duplicate | — | — |  |
| PAP-9 | Duplicate | — | — |  |
| PAP-10 | Duplicate | — | — |  |
| PAP-11 | Duplicate | — | — |  |
| PAP-12 | Duplicate | — | — |  |
| PAP-13 | Done | — | `LABEL_CHARACTER` |  |
| PAP-14 | Done | — | `LABEL_CHARACTER` |  |
| PAP-15 | In Progress | — | `LABEL_CHARACTER` |  |
| PAP-16 | In Progress | — | `LABEL_CHARACTER` |  |
| PAP-17 | Ready for Claude | — | `LABEL_CHARACTER` |  |
| PAP-18 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-19 | Backlog | — | `LABEL_CHARACTER` | umbrella |
| PAP-20 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-21 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-22 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-23 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-24 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-25 | Needs Justin | — | `LABEL_CHARACTER` |  |
| PAP-26 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-27 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-28 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-29 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-30 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-31 | Done | — | `LABEL_CHARACTER` |  |
| PAP-32 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-33 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-34 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-35 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-36 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | umbrella |
| PAP-37 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-38 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-39 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-40 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-41 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-42 | In Progress | — | `LABEL_CHARACTER` |  |
| PAP-43 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | umbrella |
| PAP-44 | Done | — | `LABEL_CHARACTER` |  |
| PAP-45 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-46 | Done | — | `LABEL_CHARACTER` |  |
| PAP-47 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-48 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-49 | Ready for Claude | — | `LABEL_CHARACTER` |  |
| PAP-50 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-51 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-52 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-53 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-54 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-55 | In Review | — | `LABEL_CHARACTER` |  |
| PAP-56 | Done | — | `LABEL_CHARACTER` |  |
| PAP-57 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-58 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-59 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-60 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-61 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-62 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-63 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-64 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-65 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-66 | In Progress | — | `LABEL_CHARACTER` |  |
| PAP-67 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-68 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-69 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-70 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-71 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-72 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-73 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-74 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-75 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | umbrella |
| PAP-76 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-77 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-78 | In Progress | — | `LABEL_CHARACTER` |  |
| PAP-79 | Done | — | `LABEL_CHARACTER` |  |
| PAP-80 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-81 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-82 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-83 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-84 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-85 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-86 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-87 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-88 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-89 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-90 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-91 | Done | — | `LABEL_CHARACTER` |  |
| PAP-92 | Done | — | `LABEL_CHARACTER` |  |
| PAP-93 | In Progress | — | `LABEL_CHARACTER` |  |
| PAP-94 | In Progress | — | `LABEL_CHARACTER` |  |
| PAP-95 | Ready for Claude | — | `LABEL_CHARACTER` |  |
| PAP-96 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-97 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-98 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-99 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-100 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-101 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-102 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-103 | In Review | — | `LABEL_CHARACTER` |  |
| PAP-104 | Backlog | — | `LABEL_CHARACTER` | umbrella |
| PAP-105 | Backlog | — | `LABEL_CHARACTER` |  |
| PAP-106 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-107 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-108 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-109 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-110 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-111 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-112 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-113 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-114 | In Progress | — | `LABEL_CHARACTER` |  |
| PAP-115 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-116 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-117 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-118 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-119 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-120 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-121 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-122 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-123 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-124 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-125 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-126 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-127 | Done | — | `LABEL_CHARACTER` |  |
| PAP-128 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-129 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-130 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-131 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-132 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-133 | Ready for Claude | — | `LABEL_CHARACTER` |  |
| PAP-134 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-135 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-136 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-137 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-138 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-139 | In Review | — | `LABEL_CHARACTER` |  |
| PAP-140 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-141 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-142 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-143 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-144 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-145 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-146 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-147 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-148 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-149 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-150 | In Review | — | `LABEL_CHARACTER` |  |
| PAP-151 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-152 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-153 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-154 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-155 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-156 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-157 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-158 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-159 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-160 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-161 | In Review | — | `LABEL_CHARACTER` |  |
| PAP-162 | Done | — | `LABEL_CHARACTER` |  |
| PAP-163 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-164 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-165 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-166 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-167 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-168 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-169 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | umbrella |
| PAP-170 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-171 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-172 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | umbrella |
| PAP-173 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-174 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-175 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-176 | In Review | — | `LABEL_CHARACTER` |  |
| PAP-177 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-178 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-179 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-180 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-181 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-182 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-183 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-184 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-185 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-186 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-187 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-188 | Done | — | `LABEL_CHARACTER` |  |
| PAP-189 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-190 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella, Deferred |
| PAP-191 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella, Deferred |
| PAP-192 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-193 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella, Deferred |
| PAP-194 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-195 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-196 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella, Deferred |
| PAP-197 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella, Deferred |
| PAP-198 | Done | — | `LABEL_CHARACTER` |  |
| PAP-199 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-200 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-201 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-202 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-203 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella, Deferred |
| PAP-204 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella, Deferred |
| PAP-205 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-206 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella, Deferred |
| PAP-207 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella, Deferred |
| PAP-208 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-209 | Done | — | `LABEL_CHARACTER` |  |
| PAP-210 | In Progress | — | `LABEL_CHARACTER` |  |
| PAP-211 | In Progress | — | `LABEL_CHARACTER` |  |
| PAP-212 | Ready for Claude | — | `LABEL_CHARACTER` |  |
| PAP-213 | Backlog | — | `LABEL_CHARACTER` | umbrella |
| PAP-214 | Backlog | — | `LABEL_CHARACTER` | umbrella |
| PAP-215 | Backlog | — | `LABEL_CHARACTER` | umbrella |
| PAP-216 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-217 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-218 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-219 | In Review | — | `LABEL_CHARACTER` |  |
| PAP-220 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | umbrella |
| PAP-221 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-222 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-223 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-224 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-225 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-226 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-227 | Backlog | — | `LABEL_CHARACTER` |  |
| PAP-228 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-229 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-230 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-231 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-232 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-233 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-234 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-235 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-236 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-237 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-238 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-239 | Backlog | — | `LABEL_CHARACTER` |  |
| PAP-240 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-241 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-242 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-243 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-244 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-245 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-246 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-247 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-248 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-249 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-250 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-251 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-252 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-253 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-254 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-255 | Ready for Claude | — | `LABEL_CHARACTER` |  |
| PAP-256 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-257 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-258 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-259 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-260 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-261 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-262 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-263 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-264 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-265 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-266 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-267 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-268 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-269 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-270 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-271 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-272 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-273 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-274 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-275 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-276 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-277 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-278 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-279 | In Review | — | `LABEL_CHARACTER` |  |
| PAP-280 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-281 | In Progress | — | `LABEL_CHARACTER` |  |
| PAP-282 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-283 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-284 | Backlog | — | `LABEL_CHARACTER` |  |
| PAP-285 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-286 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-287 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-288 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-289 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-290 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-291 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-292 | Ready for Claude | — | `LABEL_CHARACTER` |  |
| PAP-293 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-294 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-295 | Ready for Claude | — | `LABEL_CHARACTER` |  |
| PAP-296 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-297 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-298 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-299 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-300 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-301 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-302 | In Progress | — | `LABEL_CHARACTER` |  |
| PAP-303 | Backlog | — | `LABEL_CHARACTER` | umbrella |
| PAP-304 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-305 | In Progress | — | `LABEL_CHARACTER` |  |
| PAP-306 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-307 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-308 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-309 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-310 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-311 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-312 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-313 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-314 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-315 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-316 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-317 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-318 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-319 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-320 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-321 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-322 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-323 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-324 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-325 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-326 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-327 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-328 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-329 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-330 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-331 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-332 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-333 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-334 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-335 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-336 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-337 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-338 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-339 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-340 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-341 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-342 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-343 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-344 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-345 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-346 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-347 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-348 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-349 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-350 | Ready for Claude | — | `LABEL_CHARACTER` |  |
| PAP-351 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-352 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-353 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-354 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-355 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-356 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-357 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-358 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-359 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-360 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-361 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-362 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-363 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-364 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-365 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-366 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-367 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-368 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-369 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-370 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-371 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-372 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-373 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-374 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-375 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-376 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-377 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-378 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-379 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-380 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-381 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | umbrella |
| PAP-382 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-383 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-384 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-385 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-386 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-387 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-388 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-389 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-390 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-391 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-392 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-393 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-394 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-395 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-396 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-397 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-398 | Ready for Claude | — | `LABEL_CHARACTER` |  |
| PAP-399 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-400 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-401 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-402 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-403 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-404 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-405 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-406 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-407 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-408 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-409 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-410 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-411 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-412 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-413 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-414 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-415 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-416 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-417 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-418 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-419 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-420 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-421 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-422 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-423 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-424 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-425 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-426 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-427 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-428 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-429 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-430 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-431 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-432 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-433 | In Progress | — | `LABEL_CHARACTER` |  |
| PAP-434 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-435 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-436 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-437 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-438 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-439 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-440 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-441 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-442 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-443 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-444 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-445 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-446 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-447 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-448 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-449 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-450 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-451 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-452 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-453 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-454 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-455 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-456 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-457 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-458 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-459 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-460 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-461 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-462 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-463 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-464 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-465 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-466 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-467 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-468 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-469 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-470 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-471 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-472 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-473 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-474 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-475 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-476 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-477 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-478 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-479 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-480 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-481 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-482 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-483 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-484 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-485 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-486 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-487 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-488 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-489 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-490 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-491 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-492 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-493 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-494 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-495 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-496 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-497 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-498 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-499 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-500 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-501 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-502 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-503 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-504 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-505 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-506 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-507 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-508 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-509 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-510 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-511 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-512 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-513 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-514 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-515 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-516 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-517 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-518 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-519 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-520 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-521 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-522 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-523 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-524 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-525 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-526 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-527 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-528 | Ready for Claude | — | `LABEL_CHARACTER` |  |
| PAP-529 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-530 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-531 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-532 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-533 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-534 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-535 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-536 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-537 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-538 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-539 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-540 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-541 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-542 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-543 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-544 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-545 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-546 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-547 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-548 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-549 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-550 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-551 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-552 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-553 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-554 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-555 | In Progress | — | `LABEL_CHARACTER` |  |
| PAP-556 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-557 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-558 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-559 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-560 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-561 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-562 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-563 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-564 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-565 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-566 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-567 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-568 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-569 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-570 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-571 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-572 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-573 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-574 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-575 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-576 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-577 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-578 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-579 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-580 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-581 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-582 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-583 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-584 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-585 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-586 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-587 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-588 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-589 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-590 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-591 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-592 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-593 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-594 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-595 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-596 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-597 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-598 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-599 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-600 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-601 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-602 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-603 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-604 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-605 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-606 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-607 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-608 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-609 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-610 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-611 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-612 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-613 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-614 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-615 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-616 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-617 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-618 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-619 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-620 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-621 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-622 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-623 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-624 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-625 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-626 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-627 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-628 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-629 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-630 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-631 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-632 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-633 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-634 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-635 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-636 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-637 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-638 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-639 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-640 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-641 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-642 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-643 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-644 | Backlog | — | `LABEL_CHARACTER` |  |
| PAP-645 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-646 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-647 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-648 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-649 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-650 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-651 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-652 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-653 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-654 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-655 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-656 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-657 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-658 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-659 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-660 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-661 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-662 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-663 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-664 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-665 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-666 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-667 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-668 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-669 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-670 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-671 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-672 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-673 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-674 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-675 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-676 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-677 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-678 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-679 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-680 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-681 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-682 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-683 | Ready for Claude | — | `LABEL_CHARACTER` |  |
| PAP-684 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-685 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-686 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-687 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-688 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-689 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-690 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-691 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-692 | Ready for Claude | — | `LABEL_CHARACTER` |  |
| PAP-693 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-694 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-695 | Backlog | — | `LABEL_CHARACTER` |  |
| PAP-696 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-697 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-698 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-699 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-700 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-701 | Backlog | — | `LABEL_CHARACTER` |  |
| PAP-702 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-703 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-704 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-705 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-706 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-707 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-708 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-709 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-710 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-711 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-712 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-713 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-714 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-715 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-716 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-717 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-718 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-719 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-720 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-721 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-722 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-723 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-724 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-725 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-726 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-727 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-728 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-729 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-730 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-731 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-732 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-733 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-734 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-735 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-736 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-737 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-738 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-739 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-740 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-741 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-742 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-743 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-744 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-745 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-746 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-747 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-748 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-749 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-750 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-751 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-752 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-753 | Ready for Claude | — | `LABEL_CHARACTER` |  |
| PAP-754 | In Review | — | `LABEL_CHARACTER` |  |
| PAP-755 | Ready for Claude | — | `LABEL_CHARACTER` |  |
| PAP-756 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-757 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-758 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-759 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-760 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-761 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-762 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-763 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-764 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-765 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-766 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-767 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-768 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-769 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-770 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-771 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-772 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-773 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-774 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-775 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-776 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-777 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-778 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-779 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-780 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-781 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-782 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-783 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-784 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-785 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-786 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-787 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-788 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-789 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-790 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-791 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-792 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-793 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-794 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-795 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-796 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-797 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-798 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-799 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-800 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-801 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-802 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-803 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-804 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-805 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-806 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-807 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-808 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-809 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-810 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-811 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-812 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-813 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-814 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-815 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-816 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-817 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-818 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-819 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-820 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-821 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-822 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-823 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-824 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-825 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-826 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-827 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-828 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-829 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-830 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-831 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-832 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-833 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-834 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-835 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-836 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-837 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-838 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-839 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-840 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-841 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-842 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-843 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-844 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-845 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-846 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-847 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-848 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-849 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-850 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-851 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-852 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-853 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-854 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-855 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-856 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-857 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-858 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-859 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-860 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-861 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-862 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-863 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-864 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-865 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-866 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-867 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-868 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-869 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-870 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-871 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-872 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-873 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-874 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-875 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-876 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-877 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-878 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-879 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-880 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-881 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-882 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-883 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-884 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-885 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-886 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-887 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-888 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-889 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-890 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-891 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-892 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-893 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-894 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-895 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-896 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-897 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-898 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-899 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-900 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-901 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-902 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-903 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-904 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-905 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-906 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-907 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-908 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-909 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-910 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-911 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-912 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-913 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-914 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-915 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-916 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-917 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-918 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-919 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-920 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-921 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-922 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-923 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-924 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-925 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-926 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-927 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-928 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-929 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-930 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-931 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-932 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-933 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-934 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-935 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-936 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-937 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-938 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-939 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-940 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-941 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-942 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-943 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-944 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-945 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-946 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-947 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-948 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-949 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-950 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-951 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-952 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-953 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-954 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-955 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-956 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-957 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-958 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-959 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-960 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-961 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-962 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-963 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-964 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-965 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-966 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-967 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-968 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-969 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-970 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-971 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-972 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-973 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-974 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-975 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-976 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-977 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-978 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-979 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-980 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-981 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-982 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-983 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-984 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-985 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-986 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-987 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-988 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-989 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-990 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-991 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-992 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-993 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-994 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-995 | Triage | — | `BAD_SIZE` `LABEL_PHASE` `LABEL_CHARACTER` |  |
| PAP-996 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-997 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-998 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-999 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-1000 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-1001 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-1002 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-1003 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-1004 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-1005 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-1006 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-1007 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-1008 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-1009 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-1010 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-1011 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-1012 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-1013 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-1014 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-1015 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-1016 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-1017 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-1018 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-1019 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-1020 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-1021 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-1022 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-1023 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-1024 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |
| PAP-1025 | Triage | — | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` `LABEL_CHARACTER` |  |

_11 page(s), Linear complexity 3322 total (budget 10,000 per query)._


---

### Issue contract audit — state Backlog, mode build-loop, 2026-09-19T02:18Z

848 issue(s); 1 with contract (shape) errors; 834 blocked/unclaimable only (`BLOCKED_BY_OPEN`, `READY_BUT_BLOCKED`, `UMBRELLA_NOT_CLAIMABLE`); 13 warnings only; 0 clean.

Pre-promotion list: 7 of 848 Backlog issue(s) promotable now (zero errors, leaf, not Deferred): PAP-105, PAP-227, PAP-239, PAP-284, PAP-644, PAP-695, PAP-701.

| State | Issues | With errors | Warnings only | Clean |
|---|---:|---:|---:|---:|
| Backlog | 848 | 835 | 13 | 0 |

| Code | As error | As warning |
|---|---:|---:|
| `BLOCKED_BY_OPEN` | 834 | 0 |
| `MISSING_SECTION` | 1 | 1 |
| `LABEL_PHASE` | 1 | 0 |
| `LABEL_TYPE` | 1 | 0 |
| `LABEL_SURFACE` | 1 | 0 |
| `LABEL_CHARACTER` | 0 | 848 |
| `NO_SPEC_LINK` | 0 | 116 |

| Issue | State | Errors | Warnings | Note |
|---|---|---|---|---|
| PAP-5 | Backlog | `MISSING_SECTION` `LABEL_PHASE` `LABEL_TYPE` `LABEL_SURFACE` | `MISSING_SECTION` `LABEL_CHARACTER` |  |
| PAP-18 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-19 | Backlog | — | `LABEL_CHARACTER` | umbrella |
| PAP-20 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-21 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-22 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-23 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-24 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-26 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-27 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-28 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-29 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-30 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-32 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-33 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-34 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-35 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-36 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | umbrella |
| PAP-37 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-38 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-39 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-40 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-41 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-43 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | umbrella |
| PAP-45 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-47 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-48 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-50 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-51 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-52 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-53 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-54 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-57 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-58 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-59 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-60 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-61 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-62 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-63 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-64 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-65 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-67 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-68 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-69 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-70 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-71 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-72 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-73 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-74 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-75 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | umbrella |
| PAP-76 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-77 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-80 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-81 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-82 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-83 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-84 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-85 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-86 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-87 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-88 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-89 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-90 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-96 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-97 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-98 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-99 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-100 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-101 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-102 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-104 | Backlog | — | `LABEL_CHARACTER` | umbrella |
| PAP-105 | Backlog | — | `LABEL_CHARACTER` |  |
| PAP-106 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-107 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-108 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-109 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-110 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-111 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-112 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-113 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-115 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-116 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-117 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-118 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-119 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-120 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-121 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-122 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-123 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-124 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-125 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-126 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-128 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-129 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-130 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-131 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-132 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-134 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-135 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-136 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-137 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-138 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-140 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-141 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-142 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-143 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-144 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-145 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-146 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-147 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-148 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-149 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-151 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-152 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-153 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-154 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-155 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-156 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-157 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-158 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-159 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-160 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-163 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-164 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-165 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-166 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-167 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-168 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-169 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | umbrella |
| PAP-170 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-171 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-172 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | umbrella |
| PAP-173 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-174 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-175 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-177 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-178 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-179 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-180 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-181 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-182 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-183 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-184 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-185 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-186 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-187 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-189 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-190 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella, Deferred |
| PAP-191 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella, Deferred |
| PAP-192 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-193 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella, Deferred |
| PAP-194 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-195 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-196 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella, Deferred |
| PAP-197 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella, Deferred |
| PAP-199 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-200 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-201 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-202 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-203 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella, Deferred |
| PAP-204 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella, Deferred |
| PAP-205 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-206 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella, Deferred |
| PAP-207 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella, Deferred |
| PAP-208 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-213 | Backlog | — | `LABEL_CHARACTER` | umbrella |
| PAP-214 | Backlog | — | `LABEL_CHARACTER` | umbrella |
| PAP-215 | Backlog | — | `LABEL_CHARACTER` | umbrella |
| PAP-216 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-217 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-218 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-220 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | umbrella |
| PAP-221 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-222 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-223 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-224 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-225 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-226 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-227 | Backlog | — | `LABEL_CHARACTER` |  |
| PAP-228 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-229 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-230 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-231 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-232 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-233 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-234 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-235 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-236 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-237 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-238 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-239 | Backlog | — | `LABEL_CHARACTER` |  |
| PAP-240 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-241 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-242 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-243 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-244 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-245 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-246 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-247 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-248 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-249 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-250 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-251 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-252 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-253 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-254 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-256 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-257 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-258 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-259 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-260 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-261 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-262 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-263 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-264 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-265 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-266 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-267 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-268 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-269 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-270 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-271 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-272 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-273 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-274 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-275 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-276 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-277 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-278 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-280 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-282 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-283 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-284 | Backlog | — | `LABEL_CHARACTER` |  |
| PAP-285 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-286 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-287 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-288 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-289 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-290 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-291 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-293 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-294 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-296 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-297 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-298 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-299 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-300 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-301 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-303 | Backlog | — | `LABEL_CHARACTER` | umbrella |
| PAP-304 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-306 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-307 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-308 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-309 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-310 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-311 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-312 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-313 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-314 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-315 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-316 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-317 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-318 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-319 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-320 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-321 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-322 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-323 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-324 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-325 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-326 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-327 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-328 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-329 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-330 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-331 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-332 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-333 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-334 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-335 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-336 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-337 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-338 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-339 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-340 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-341 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-342 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-343 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-344 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-345 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-346 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-347 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-348 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-349 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-351 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-352 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-353 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-354 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-355 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-356 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-357 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-358 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-359 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-360 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-361 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-362 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-363 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-364 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-365 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-366 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-367 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-368 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-369 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-370 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-371 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-372 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-373 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-374 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-375 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-376 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-377 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-378 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-379 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-380 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-381 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | umbrella |
| PAP-382 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-383 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-384 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-385 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-386 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-387 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-388 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-389 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-390 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-391 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-392 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-393 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-394 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-395 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-396 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-397 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-399 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-400 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-401 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-402 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-403 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-404 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-405 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-406 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-407 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-408 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-409 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-410 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-411 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-412 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-413 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-414 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-415 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-416 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-417 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-418 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-419 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-420 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-421 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-422 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-423 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-424 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-425 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-426 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-427 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-428 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-429 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-430 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | umbrella |
| PAP-431 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-432 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-434 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-435 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-436 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-437 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-438 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-439 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-440 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-441 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-442 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-443 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-444 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-445 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-446 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-447 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-448 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-449 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-450 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-451 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-452 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-453 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-454 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-455 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-456 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-457 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-458 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-459 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-460 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-461 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-462 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-463 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-464 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-465 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-466 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-467 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-468 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-469 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-470 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-471 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-472 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-473 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-474 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-475 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-476 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-477 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-478 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-479 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-480 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-481 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-482 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-483 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-484 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-485 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-486 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-487 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-488 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-489 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-490 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-491 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-492 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-493 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-494 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-495 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-496 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-497 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-498 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-499 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-500 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-501 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-502 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-503 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-504 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-505 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-506 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-507 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-508 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-509 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-510 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-511 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-512 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-513 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-514 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-515 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-516 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-517 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-518 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-519 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-520 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-521 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-522 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-523 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-524 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-525 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-526 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-527 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-529 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-530 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-531 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-532 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-533 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-534 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-535 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-536 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-537 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-538 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-539 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-540 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-541 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-542 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-543 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-544 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-545 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-546 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-547 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-548 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-549 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-550 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-551 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-552 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-553 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-554 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-556 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-557 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-558 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-559 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-560 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-561 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-562 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-563 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-564 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-565 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-566 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-567 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-568 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-569 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-570 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-571 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-572 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-573 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-574 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-575 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-576 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-577 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-578 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-579 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-580 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-581 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-582 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-583 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-584 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-585 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-586 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-587 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-588 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-589 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-590 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-591 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-592 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-593 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-594 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-595 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-596 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-597 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-598 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-599 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-600 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-601 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-602 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-603 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-604 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-605 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-606 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-607 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-608 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-609 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-610 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-611 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-612 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-613 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-614 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-615 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-616 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-617 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-618 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-619 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-620 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-621 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-622 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-623 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-624 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-625 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-626 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-627 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-628 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-629 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-630 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-631 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-632 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-633 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-634 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-635 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-636 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-637 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-638 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-639 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-640 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-641 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-642 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-643 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-644 | Backlog | — | `LABEL_CHARACTER` |  |
| PAP-645 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-646 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-647 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-648 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-649 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-650 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-651 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-652 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-653 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-654 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-655 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-656 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-657 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-658 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-659 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-660 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-661 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-662 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-663 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-664 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-665 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-666 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-667 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-668 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-669 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-670 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-671 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-672 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-673 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-674 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-675 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-676 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-677 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-678 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-679 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-680 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-681 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-682 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-684 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-685 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-686 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-687 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-688 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-689 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-690 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-691 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-693 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-694 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-695 | Backlog | — | `LABEL_CHARACTER` |  |
| PAP-696 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-697 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-698 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-699 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-700 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-701 | Backlog | — | `LABEL_CHARACTER` |  |
| PAP-702 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-703 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-704 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-705 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-706 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-707 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-708 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-709 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-710 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-711 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-712 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-713 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-714 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-715 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-716 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-717 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-718 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-719 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-720 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-721 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-722 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-723 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-724 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-725 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-726 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-727 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-728 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-729 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-730 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-731 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-732 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-733 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-734 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-735 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-736 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-737 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-738 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-739 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-740 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-741 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-742 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-743 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-744 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-745 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-746 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-747 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-748 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-749 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-750 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-751 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-752 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-756 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-757 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-758 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-759 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-760 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-761 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-762 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-763 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-764 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-765 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-766 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-767 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-768 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-769 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-770 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-771 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-772 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-773 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-774 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-775 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-776 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-777 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-778 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-779 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-780 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-781 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-782 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-783 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-784 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-785 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-786 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-787 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-788 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-789 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-790 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-791 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-792 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-793 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-794 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-795 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-796 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-797 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-798 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-799 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-800 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-801 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-802 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-803 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-804 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-805 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-806 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-807 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-808 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-809 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-810 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-811 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-812 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-813 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-814 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-815 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-816 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-817 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-818 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-819 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-820 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-821 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-822 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-823 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-824 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-825 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-826 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-827 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-828 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-829 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-830 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-831 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-832 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-833 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-834 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-835 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-836 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-837 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-838 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-839 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-840 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-841 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-842 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-843 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-844 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-845 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-846 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-847 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-848 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-849 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-850 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-851 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-852 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-853 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-854 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-855 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-856 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-857 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-858 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-859 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-860 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-861 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-862 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-863 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-864 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-865 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-866 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-867 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-868 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-869 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-870 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-871 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-872 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-873 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-874 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-875 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-876 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-877 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-878 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-879 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-880 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-881 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-882 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-883 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-884 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-885 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-886 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-887 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-888 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-889 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-890 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-891 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-892 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-893 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-894 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-895 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-896 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-897 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-898 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-899 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-900 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-901 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-902 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-903 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-904 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-905 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-906 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-907 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-908 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` |  |
| PAP-909 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-910 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` | Deferred |
| PAP-911 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |
| PAP-912 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` |  |
| PAP-913 | Backlog | `BLOCKED_BY_OPEN` | `LABEL_CHARACTER` `NO_SPEC_LINK` | Deferred |

_9 page(s), Linear complexity 2718 total (budget 10,000 per query)._


---

### Comparison: Ready for Claude in `pr-flow` mode

15 issue(s); 0 with contract (shape) errors; 1 blocked/unclaimable only (`BLOCKED_BY_OPEN`, `READY_BUT_BLOCKED`, `UMBRELLA_NOT_CLAIMABLE`); 14 warnings only; 0 clean.

| PAP-398 | Ready for Claude | `READY_BUT_BLOCKED` | `LABEL_CHARACTER` |  |
