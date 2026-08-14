import ipaddress
import re
from typing import List


class DNSValidationError(ValueError):
    """Custom exception raised for DNS validation errors."""
    pass


def normalize_domain_name(name: str) -> str:
    """Normalize a domain name by stripping whitespace, trailing dots, and converting to lowercase."""
    if not name:
        return ""
    name = name.strip().lower()
    # Strip any trailing dots
    while name.endswith("."):
        name = name[:-1]
    return name


def is_valid_hostname_label(label: str, allow_wildcard: bool = False) -> bool:
    """Validate an individual DNS label (RFC 1123)."""
    if allow_wildcard and label == "*":
        return True
    if not label or len(label) > 63:
        return False
    # Cannot start or end with hyphen
    if label.startswith("-") or label.endswith("-"):
        return False
    # Must only contain letters, digits, and hyphens (and underscores for SRV service labels like _sip._tcp)
    return bool(re.match(r"^[a-zA-Z0-9_-]+$", label))


def is_valid_hostname(hostname: str, allow_wildcard_prefix: bool = False) -> bool:
    """Validate a full hostname / domain name."""
    normalized = normalize_domain_name(hostname)
    if not normalized or len(normalized) > 253:
        return False

    # A hostname cannot be a raw IP address
    try:
        # Avoid catching DNSValidationError by testing before instantiating custom exceptions
        ipaddress.IPv4Address(normalized)
        return False
    except (ValueError, Exception):
        pass

    try:
        ipaddress.IPv6Address(normalized)
        return False
    except (ValueError, Exception):
        pass

    labels = normalized.split(".")
    # TLD cannot be all-numeric in a multi-label hostname
    if len(labels) > 1 and labels[-1].isdigit():
        return False

    for idx, label in enumerate(labels):
        if idx == 0 and allow_wildcard_prefix and label == "*":
            continue
        if not is_valid_hostname_label(label):
            return False
    return True


def normalize_record_name(raw_name: str, zone_name: str) -> str:
    """
    Normalize record name relative to the hosted zone.
    Supports empty name or '@' for zone apex.
    Normalizes subdomains, wildcards (e.g. *.example.com), and trailing dots.
    """
    norm_zone = normalize_domain_name(zone_name)
    if not norm_zone:
        raise DNSValidationError("Invalid hosted zone name.")

    if raw_name is None:
        raw_name = ""
    raw_name = raw_name.strip()

    # Apex representations
    if raw_name == "" or raw_name == "@":
        return norm_zone

    # Strip trailing dot
    norm_raw = normalize_domain_name(raw_name)

    # If raw_name is already the zone name
    if norm_raw == norm_zone:
        return norm_zone

    # If raw_name is wildcard apex '*'
    if norm_raw == "*":
        return f"*.{norm_zone}"

    # If raw_name ends with .zone_name
    if norm_raw.endswith(f".{norm_zone}"):
        full_name = norm_raw
    else:
        full_name = f"{norm_raw}.{norm_zone}"

    # Validate the full record name
    if not is_valid_hostname(full_name, allow_wildcard_prefix=True):
        raise DNSValidationError(
            f"Invalid DNS record name '{raw_name}'. Must be a valid domain or subdomain name."
        )

    # Reject wildcard placement other than the first label
    labels = full_name.split(".")
    if "*" in labels and labels[0] != "*":
        raise DNSValidationError(
            f"Invalid wildcard placement in '{raw_name}'. Wildcard '*' must only be the leftmost label."
        )
    if labels.count("*") > 1:
        raise DNSValidationError(
            f"Multiple wildcards are not allowed in '{raw_name}'."
        )

    return full_name


def validate_a_record(values: List[str]) -> None:
    """Validate that every value is a valid IPv4 address."""
    if not values:
        raise DNSValidationError("A record must have at least one IP address.")
    for val in values:
        val = val.strip()
        try:
            ipaddress.IPv4Address(val)
        except (ValueError, Exception):
            raise DNSValidationError(f"Invalid IPv4 address '{val}' for A record.")


def validate_aaaa_record(values: List[str]) -> None:
    """Validate that every value is a valid IPv6 address."""
    if not values:
        raise DNSValidationError("AAAA record must have at least one IP address.")
    for val in values:
        val = val.strip()
        try:
            ipaddress.IPv6Address(val)
        except (ValueError, Exception):
            raise DNSValidationError(f"Invalid IPv6 address '{val}' for AAAA record.")


def validate_cname_record(values: List[str], record_name: str, zone_name: str) -> None:
    """Validate CNAME record: single value, valid hostname, not at apex."""
    if len(values) != 1:
        raise DNSValidationError("CNAME record must contain exactly one target value.")
    
    norm_record = normalize_domain_name(record_name)
    norm_zone = normalize_domain_name(zone_name)
    if norm_record == norm_zone:
        raise DNSValidationError(
            "CNAME record cannot be created at the hosted zone apex. Use an A record or alias instead."
        )

    target = values[0].strip()
    # Check if target is an IP address - CNAME must be a hostname, not an IP
    is_ip = False
    try:
        ipaddress.ip_address(target)
        is_ip = True
    except (ValueError, Exception):
        is_ip = False

    if is_ip:
        raise DNSValidationError(
            f"CNAME value '{target}' cannot be an IP address. It must be a valid hostname."
        )

    if not is_valid_hostname(target, allow_wildcard_prefix=False):
        raise DNSValidationError(f"CNAME target '{target}' must be a valid hostname.")


def validate_txt_record(values: List[str]) -> None:
    """Validate TXT record strings."""
    if not values:
        raise DNSValidationError("TXT record must contain at least one text value.")
    for val in values:
        if val is None or len(val.strip()) == 0:
            raise DNSValidationError("TXT record value cannot be empty.")
        if len(val) > 4000:
            raise DNSValidationError("TXT record value exceeds maximum allowed length of 4000 characters.")


def validate_mx_record(values: List[str]) -> None:
    """Validate MX records format: '<priority: int> <hostname>'."""
    if not values:
        raise DNSValidationError("MX record must contain at least one value.")
    for val in values:
        parts = val.strip().split()
        if len(parts) != 2:
            raise DNSValidationError(
                f"Invalid MX record '{val}'. Format must be '<priority> <mail-server>' (e.g. '10 mail.example.com')."
            )
        priority_str, hostname = parts
        try:
            priority = int(priority_str)
            if priority < 0 or priority > 65535:
                raise ValueError()
        except ValueError:
            raise DNSValidationError(
                f"Invalid MX priority '{priority_str}' in '{val}'. Priority must be an integer between 0 and 65535."
            )
        if not is_valid_hostname(hostname, allow_wildcard_prefix=False):
            raise DNSValidationError(
                f"Invalid MX mail server hostname '{hostname}' in '{val}'."
            )


def validate_ns_record(values: List[str]) -> None:
    """Validate NS records: each value must be a valid hostname."""
    if not values:
        raise DNSValidationError("NS record must contain at least one nameserver value.")
    for val in values:
        hostname = val.strip()
        if not is_valid_hostname(hostname, allow_wildcard_prefix=False):
            raise DNSValidationError(f"Invalid NS hostname '{hostname}'.")


def validate_ptr_record(values: List[str]) -> None:
    """Validate PTR records: each value must be a valid hostname."""
    if not values:
        raise DNSValidationError("PTR record must contain at least one hostname value.")
    for val in values:
        hostname = val.strip()
        if not is_valid_hostname(hostname, allow_wildcard_prefix=False):
            raise DNSValidationError(f"Invalid PTR domain name '{hostname}'.")


def validate_srv_record(values: List[str]) -> None:
    """
    Validate SRV record format: '<priority> <weight> <port> <target>'.
    Example: '10 5 443 api.example.com'
    """
    if not values:
        raise DNSValidationError("SRV record must contain at least one value.")
    for val in values:
        parts = val.strip().split()
        if len(parts) != 4:
            raise DNSValidationError(
                f"Invalid SRV record '{val}'. Format must be '<priority> <weight> <port> <target>' (e.g. '10 5 443 api.example.com')."
            )
        priority_str, weight_str, port_str, target = parts
        try:
            priority = int(priority_str)
            if priority < 0 or priority > 65535:
                raise ValueError()
        except ValueError:
            raise DNSValidationError(
                f"Invalid SRV priority '{priority_str}' in '{val}'. Priority must be an integer between 0 and 65535."
            )

        try:
            weight = int(weight_str)
            if weight < 0 or weight > 65535:
                raise ValueError()
        except ValueError:
            raise DNSValidationError(
                f"Invalid SRV weight '{weight_str}' in '{val}'. Weight must be an integer between 0 and 65535."
            )

        try:
            port = int(port_str)
            if port < 0 or port > 65535:
                raise ValueError()
        except ValueError:
            raise DNSValidationError(
                f"Invalid SRV port '{port_str}' in '{val}'. Port must be an integer between 0 and 65535."
            )

        if not is_valid_hostname(target, allow_wildcard_prefix=False):
            raise DNSValidationError(
                f"Invalid SRV target hostname '{target}' in '{val}'."
            )


def validate_caa_record(values: List[str]) -> None:
    """
    Validate CAA record format: '<flags> <tag> "<value>"'.
    Example: '0 issue "letsencrypt.org"'
    """
    if not values:
        raise DNSValidationError("CAA record must contain at least one value.")
    for val in values:
        raw = val.strip()
        # Match flags (0-255), tag (alphanumeric tag like issue, issuewild, iodef), and value (quoted or unquoted string)
        match = re.match(r"^(\d+)\s+([a-zA-Z0-9]+)\s+(.+)$", raw)
        if not match:
            raise DNSValidationError(
                f"Invalid CAA record '{raw}'. Expected format: '<flags> <tag> \"<value>\"' (e.g. '0 issue \"letsencrypt.org\"')."
            )
        flags_str, tag, caa_val = match.groups()
        try:
            flags = int(flags_str)
            if flags < 0 or flags > 255:
                raise ValueError()
        except ValueError:
            raise DNSValidationError(
                f"Invalid CAA flags '{flags_str}' in '{raw}'. Flags must be an integer between 0 and 255."
            )

        # Remove surrounding quotes if present
        clean_val = caa_val.strip()
        if (clean_val.startswith('"') and clean_val.endswith('"')) or (clean_val.startswith("'") and clean_val.endswith("'")):
            clean_val = clean_val[1:-1]

        if not clean_val:
            raise DNSValidationError(f"Invalid CAA value in '{raw}'. CAA value cannot be empty.")


def validate_soa_record(values: List[str]) -> None:
    """Validate internal SOA record structure."""
    if not values:
        raise DNSValidationError("SOA record must contain at least one value.")
    for val in values:
        parts = val.strip().split()
        if len(parts) != 7:
            raise DNSValidationError(
                f"Invalid SOA record '{val}'. Expected 7 fields: '<primary-ns> <hostmaster> <serial> <refresh> <retry> <expire> <min-ttl>'."
            )


def validate_dns_record(
    record_type: str,
    values: List[str],
    record_name: str,
    zone_name: str,
) -> None:
    """Dispatch validation according to DNS record type."""
    if not values:
        raise DNSValidationError("DNS record values list cannot be empty.")

    rtype = record_type.upper()
    if rtype == "A":
        validate_a_record(values)
    elif rtype == "AAAA":
        validate_aaaa_record(values)
    elif rtype == "CNAME":
        validate_cname_record(values, record_name, zone_name)
    elif rtype == "TXT":
        validate_txt_record(values)
    elif rtype == "MX":
        validate_mx_record(values)
    elif rtype == "NS":
        validate_ns_record(values)
    elif rtype == "PTR":
        validate_ptr_record(values)
    elif rtype == "SRV":
        validate_srv_record(values)
    elif rtype == "CAA":
        validate_caa_record(values)
    elif rtype == "SOA":
        validate_soa_record(values)
    else:
        raise DNSValidationError(f"Unsupported DNS record type '{record_type}'.")
